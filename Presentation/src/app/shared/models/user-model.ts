export class User {
    id: string;
    username: string;
    rol_id: number;

    get cedula(): string {
        return this.id;
    }

    get nombre(): string {
        return this.username;
    }

    get rol(): number {
        return this.rol_id;
    }

    constructor(usr?: Partial<User> & { cedula?: string; nombre?: string; rol?: number }) {
        this.id = usr?.id ?? usr?.cedula ?? '';
        this.username = usr?.username ?? usr?.nombre ?? '';
        this.rol_id = usr?.rol_id ?? usr?.rol ?? -1;
    }
}
