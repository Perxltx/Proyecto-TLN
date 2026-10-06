def limitar(valor, minimo=0, maximo=255):

    if valor < minimo:
        return minimo

    if valor > maximo:
        return maximo

    return valor


def rgb_a_gris(r, g, b):

    gris = (
        0.299 * r +
        0.587 * g +
        0.114 * b
    )

    return limitar(gris)


def rgb_a_hsv(r, g, b):

    r = r / 255.0
    g = g / 255.0
    b = b / 255.0

    maximo = max(r, g, b)
    minimo = min(r, g, b)

    diferencia = maximo - minimo

    h = 0

    if diferencia != 0:

        if maximo == r:

            h = (
                60 *
                (((g - b) / diferencia) % 6)
            )

        elif maximo == g:

            h = (
                60 *
                (((b - r) / diferencia) + 2)
            )

        else:

            h = (
                60 *
                (((r - g) / diferencia) + 4)
            )

    if h < 0:
        h += 360

    if maximo == 0:
        s = 0
    else:
        s = diferencia / maximo

    v = maximo

    return h, s, v


def promedio(valores):

    if len(valores) == 0:
        return 0

    suma = 0

    for valor in valores:
        suma += valor

    return suma / len(valores)


def desviacion_estandar(valores):

    if len(valores) == 0:
        return 0

    media = promedio(valores)

    suma = 0

    for valor in valores:

        diferencia = valor - media

        suma += diferencia * diferencia

    varianza = suma / len(valores)

    return varianza ** 0.5


def analizar_pixeles(pixeles):

    """
    pixeles debe tener:

    [
        [R, G, B],
        [R, G, B],
        ...
    ]
    """

    if len(pixeles) == 0:

        return {
            "error": "No existen píxeles."
        }


    grises = []

    saturaciones = []

    rojos = []
    verdes = []
    azules = []


    minimo = 255
    maximo = 0


    for pixel in pixeles:

        r = pixel[0]
        g = pixel[1]
        b = pixel[2]


        rojos.append(r)
        verdes.append(g)
        azules.append(b)


        gris = rgb_a_gris(
            r,
            g,
            b
        )


        grises.append(gris)


        if gris < minimo:
            minimo = gris


        if gris > maximo:
            maximo = gris


        h, s, v = rgb_a_hsv(
            r,
            g,
            b
        )


        saturaciones.append(s)


    media_gris = promedio(grises)

    desviacion = desviacion_estandar(grises)

    saturacion = promedio(saturaciones)


    rango = maximo - minimo


    if media_gris < 70:

        iluminacion = "oscura"

    elif media_gris > 190:

        iluminacion = "muy iluminada"

    else:

        iluminacion = "adecuada"


    if desviacion < 35:

        contraste = "bajo"

    elif desviacion > 75:

        contraste = "alto"

    else:

        contraste = "adecuado"


    if saturacion < 0.12:

        color = "bajo"

    else:

        color = "significativo"


    return {

        "brillo": media_gris,

        "contraste": desviacion,

        "saturacion": saturacion,

        "rango_dinamico": rango,

        "iluminacion": iluminacion,

        "estado_contraste": contraste,

        "estado_color": color

    }