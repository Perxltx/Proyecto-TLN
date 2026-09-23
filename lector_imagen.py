def leer_archivo_binario(nombre):

    archivo = open(
        nombre,
        "rb"
    )

    datos = archivo.read()

    archivo.close()

    return datos


def eliminar_comentarios(datos):

    resultado = []

    i = 0

    while i < len(datos):

        if datos[i] == 35:

            while (
                i < len(datos)
                and datos[i] != 10
            ):
                i += 1

        else:

            resultado.append(
                datos[i]
            )

        i += 1

    return bytes(resultado)


def separar_tokens(datos):

    datos = eliminar_comentarios(
            datos
        )

    tokens = []

    actual = bytearray()

    for byte in datos:

        if byte in (
            9,
            10,
            13,
            32
        ):

            if len(actual) > 0:

                tokens.append(
                    bytes(actual)
                )

                actual = bytearray()

        else:

            actual.append(byte)


    if len(actual) > 0:

        tokens.append(
            bytes(actual)
        )


    return tokens


def leer_pgm(nombre):

    datos = leer_archivo_binario(
            nombre
        )


    if not datos.startswith(b"P5"):

        raise ValueError(
            "El archivo no es PGM binario P5."
        )


    tokens = separar_tokens(
            datos
        )


    ancho = int(tokens[1])


    alto = int(tokens[2])


    maximo = int(tokens[3])


    posicion = datos.find(
            tokens[3]
        )


    if posicion == -1:

        raise ValueError(
            "No se encontró el encabezado."
        )


    inicio = posicion + len(tokens[3])


    while (
        inicio < len(datos)
        and datos[inicio] in
        (9, 10, 13, 32)
    ):

        inicio += 1


    pixeles = []

    for y in range(alto):

        fila = []

        for x in range(ancho):

            indice = y * ancho + x


            if indice >= (
                len(datos) - inicio
            ):

                valor = 0

            else:

                valor = datos[
                        inicio + indice
                    ]


            fila.append(valor)

        pixeles.append(fila)


    return {

        "ancho": ancho,

        "alto": alto,

        "maximo": maximo,

        "pixeles": pixeles

    }