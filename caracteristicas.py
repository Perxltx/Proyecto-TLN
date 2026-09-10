def detectar_pupila(imagen):

    ancho = imagen[0]
    alto = imagen[1]
    pixeles = imagen[3]

    suma_x = 0
    suma_y = 0
    cantidad = 0

    umbral = 50

    for y in range(alto):

        for x in range(ancho):

            valor = pixeles[y][x]

            if valor <= umbral:

                suma_x = suma_x + x
                suma_y = suma_y + y

                cantidad = cantidad + 1

    if cantidad == 0:

        return None

    centro_x = suma_x / cantidad
    centro_y = suma_y / cantidad

    return centro_x, centro_y, cantidad

def promedio_imagen(imagen):

    ancho = imagen[0]
    alto = imagen[1]
    pixeles = imagen[3]

    suma = 0
    cantidad = 0

    for y in range(alto):

        for x in range(ancho):

            suma = suma + pixeles[y][x]

            cantidad = cantidad + 1

    if cantidad == 0:
        return 0

    return suma / cantidad