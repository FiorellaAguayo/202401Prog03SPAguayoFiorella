class Extranjero extends Persona {

    constructor(id, nombre, apellido, edad, paisOrigen) {
        super(id, nombre, apellido, edad);
        this.paisOrigen = paisOrigen;
    }

    toString() {
        return `Extranjero: ` + super.toString() + `, Pais de Origen: ${this.paisDeOrigen}`;
    }

    toJson() {
        return JSON.stringify(this);
    }
}