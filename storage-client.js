(function () {
    'use strict';

    class AkashaApiError extends Error {
        constructor(message, status = 0, code = 'request_failed') {
            super(message);
            this.name = 'AkashaApiError';
            this.status = status;
            this.code = code;
        }
    }

    class PhpTimestamp {
        constructor(isoString) {
            this.iso = isoString;
            const millis = Date.parse(isoString);
            this.seconds = Number.isFinite(millis) ? Math.floor(millis / 1000) : 0;
            this.nanoseconds = 0;
        }
        toDate() { return new Date(this.iso); }
        toJSON() { return { __akashaDate: this.iso }; }
    }

    function prepareValue(value) {
        if (value instanceof Date) return { __akashaDate: value.toISOString() };
        if (value instanceof PhpTimestamp) return { __akashaDate: value.iso };
        if (Array.isArray(value)) return value.map(prepareValue);
        if (value && typeof value === 'object') {
            const result = {};
            Object.keys(value).forEach((key) => { result[key] = prepareValue(value[key]); });
            return result;
        }
        return value;
    }

    function reviveValue(value) {
        if (value instanceof PhpTimestamp) return value;
        if (Array.isArray(value)) return value.map(reviveValue);
        if (value && typeof value === 'object') {
            if (typeof value.__akashaDate === 'string') return new PhpTimestamp(value.__akashaDate);
            const result = {};
            Object.keys(value).forEach((key) => { result[key] = reviveValue(value[key]); });
            return result;
        }
        return value;
    }

    async function request(endpoint, payload, options = {}) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), options.timeout || 15000);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Akasha-Client': '2.3.0'
                },
                credentials: 'same-origin',
                cache: 'no-store',
                signal: controller.signal,
                body: JSON.stringify(prepareValue(payload))
            });
            const text = await response.text();
            let result;
            try { result = text ? JSON.parse(text) : {}; }
            catch (error) {
                throw new AkashaApiError(`Сервер вернул некорректный ответ (${response.status}).`, response.status, 'invalid_response');
            }
            if (!response.ok || result.ok === false) {
                throw new AkashaApiError(result.error || `Ошибка API: ${response.status}`, response.status, result.code || 'request_failed');
            }
            return reviveValue(result);
        } catch (error) {
            if (error?.name === 'AbortError') throw new AkashaApiError('Сервер не ответил вовремя. Проверьте подключение.', 0, 'timeout');
            if (error instanceof AkashaApiError) throw error;
            throw new AkashaApiError(error?.message || 'Не удалось связаться с сервером.', 0, 'network_error');
        } finally {
            window.clearTimeout(timeout);
        }
    }

    class DocumentSnapshot {
        constructor(ref, data, exists) {
            this.ref = ref;
            this.id = ref.id;
            this.exists = Boolean(exists);
            this._data = reviveValue(data || {});
        }
        data() { return this.exists ? this._data : undefined; }
    }

    class QuerySnapshot {
        constructor(db, collectionName, documents) {
            this.docs = documents.map((doc) => {
                const ref = new DocumentReference(db, collectionName, doc.id);
                return new DocumentSnapshot(ref, doc.data, true);
            });
            this.empty = this.docs.length === 0;
            this.size = this.docs.length;
        }
        forEach(callback) { this.docs.forEach(callback); }
    }

    class QueryReference {
        constructor(db, collectionName, filters) {
            this.db = db;
            this.collectionName = collectionName;
            this.filters = filters || [];
        }
        where(field, operator, value) {
            if (operator !== '==') throw new AkashaApiError('PHP-хранилище поддерживает только оператор ==', 400, 'unsupported_query');
            return new QueryReference(this.db, this.collectionName, [...this.filters, { field, operator, value }]);
        }
        async get() {
            const result = await request(this.db.endpoint, {
                action: 'query', collection: this.collectionName, filters: this.filters
            });
            return new QuerySnapshot(this.db, this.collectionName, result.documents || []);
        }
    }

    class DocumentReference {
        constructor(db, collectionName, id) {
            this.db = db;
            this.collectionName = collectionName;
            this.id = String(id);
        }
        async get() {
            const result = await request(this.db.endpoint, {
                action: 'get', collection: this.collectionName, id: this.id
            });
            return new DocumentSnapshot(this, result.data || {}, result.exists);
        }
        async set(data, options = {}) {
            await request(this.db.endpoint, {
                action: 'set', collection: this.collectionName, id: this.id, data,
                merge: options?.merge === true
            });
            return this;
        }
        async update(data) {
            await request(this.db.endpoint, {
                action: 'update', collection: this.collectionName, id: this.id, data
            });
            return this;
        }
        async delete() {
            await request(this.db.endpoint, {
                action: 'delete', collection: this.collectionName, id: this.id
            });
        }
    }

    class CollectionReference extends QueryReference {
        constructor(db, collectionName) { super(db, collectionName, []); }
        doc(id) { return new DocumentReference(this.db, this.collectionName, String(id)); }
        async add(data) {
            const result = await request(this.db.endpoint, {
                action: 'add', collection: this.collectionName, data
            });
            return this.doc(result.id);
        }
    }

    class WriteBatch {
        constructor(db) { this.db = db; this.operations = []; }
        update(docRef, data) {
            if (!docRef) throw new AkashaApiError('Не передана ссылка на документ.', 400, 'invalid_reference');
            this.operations.push({ action: 'update', collection: docRef.collectionName, id: docRef.id, data });
            return this;
        }
        set(docRef, data) {
            if (!docRef) throw new AkashaApiError('Не передана ссылка на документ.', 400, 'invalid_reference');
            this.operations.push({ action: 'set', collection: docRef.collectionName, id: docRef.id, data });
            return this;
        }
        delete(docRef) {
            if (!docRef) throw new AkashaApiError('Не передана ссылка на документ.', 400, 'invalid_reference');
            this.operations.push({ action: 'delete', collection: docRef.collectionName, id: docRef.id });
            return this;
        }
        async commit() {
            if (this.operations.length === 0) return;
            await request(this.db.endpoint, { action: 'batch', operations: this.operations });
            this.operations = [];
        }
    }

    class PhpDatabase {
        constructor(endpoint) {
            this.endpoint = endpoint || 'api.php';
            this.kind = 'php';
        }
        collection(name) { return new CollectionReference(this, String(name)); }
        batch() { return new WriteBatch(this); }
        async ping() { return request(this.endpoint, { action: 'health' }, { timeout: 8000 }); }
        async login(name, password) { return request(this.endpoint, { action: 'login', name, password }); }
        async logout() { return request(this.endpoint, { action: 'logout' }); }
        async getSession() { return request(this.endpoint, { action: 'session' }); }
        async getProfiles() { return request(this.endpoint, { action: 'profiles' }); }
        async createUser(data) { return request(this.endpoint, { action: 'create_user', ...data }); }
        async updateUser(userName, data) { return request(this.endpoint, { action: 'update_user', userName, ...data }); }
        async resetUserPassword(userName, password) { return request(this.endpoint, { action: 'reset_user_password', userName, password }); }
    }

    window.AkashaApiError = AkashaApiError;
    window.createPhpDatabaseClient = function createPhpDatabaseClient(endpoint) {
        return new PhpDatabase(endpoint || 'api.php');
    };
})();
