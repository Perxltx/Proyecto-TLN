from lector_imagen import cargar_pgm


imagen = cargar_pgm("alzh.pgm")


if imagen is None:

    print("No se pudo cargar la imagen.")

else:

    ancho = imagen[0]
    alto = imagen[1]
    maximo = imagen[2]
    pixeles = imagen[3]

    print("Imagen cargada correctamente")
    print("Ancho:", ancho)
    print("Alto:", alto)
    print("Valor máximo:", maximo)

    print()
    print("Primeros pixeles:")

    for y in range(3):

        for x in range(3):

            print(pixeles[y][x], end=" ")

        print()