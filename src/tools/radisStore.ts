export class DiskStore {
	static _instance: DiskStore
	record: Record<string, string | object>

	constructor() {
		this.record = {}
	}

	setKey(key: string, value: any) {
		if (!this.record) return false
		if (this.record[key]) return this.record[key]
		this.record[key] = value
		return value
	}

	getKey(key: string) {
		if (!key) return false
		if (!this.record) return false
		if (this.record[key]) return this.record[key]
		return false
	}

	delKey(key: string) {
		delete this.record[key]
	}
}

export default new DiskStore()
