class Ciudadano extends Persona
{
    constructor(id, nombre, apellido, fecha, dni) {
        super(id, nombre, apellido, fecha);
        this.dni = dni;
    }

    toString() {
        return `Ciudadano: ` + super.toString() + `, DNI: ${this.dni}`;
    }

    toJson() {
        return JSON.stringify(this);
    }
}