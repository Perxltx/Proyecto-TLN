def cargar_pgm(ruta):

    archivo = open(ruta, "r")

    datos = archivo.read()

    archivo.close()

    partes = datos.split()

    if partes[0] != "P2":
        print("Error: la imagen no es PGM P2")
        return None

    ancho = int(partes[1])
    alto = int(partes[2])
    maximo = int(partes[3])

    pixeles = []

    posicion = 4

    for y in range(alto):

        fila = []

        for x in range(ancho):

            valor = int(partes[posicion])

            fila.append(valor)

            posicion = posicion + 1

        pixeles.append(fila)

    return ancho, alto, maximo, pixeles