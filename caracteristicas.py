def promedio(valores):

    if len(valores) == 0:
        return 0

    suma = 0

    for valor in valores:
        suma += valor

    return suma / len(valores)


def minimo(valores):

    if len(valores) == 0:
        return 0

    resultado = valores[0]

    for valor in valores:

        if valor < resultado:
            resultado = valor

    return resultado


def maximo(valores):

    if len(valores) == 0:
        return 0

    resultado = valores[0]

    for valor in valores:

        if valor > resultado:
            resultado = valor

    return resultado


def rango(valores):

    if len(valores) == 0:
        return 0

    return maximo(valores) - minimo(valores)


def varianza(valores):

    if len(valores) == 0:
        return 0

    media = promedio(valores)

    suma = 0

    for valor in valores:

        diferencia = valor - media

        suma += diferencia * diferencia

    return suma / len(valores)


def desviacion_estandar(valores):

    return varianza(valores) ** 0.5


def caracteristicas_grises(grises):

    return {

        "promedio":
            promedio(grises),

        "minimo":
            minimo(grises),

        "maximo":
            maximo(grises),

        "rango":
            rango(grises),

        "varianza":
            varianza(grises),

        "desviacion":
            desviacion_estandar(grises)

    }


def histograma_grises(grises):

    histograma = [0] * 256

    for valor in grises:

        valor_entero = int(valor)

        if valor_entero < 0:
            valor_entero = 0

        if valor_entero > 255:
            valor_entero = 255

        histograma[
            valor_entero
        ] += 1

    return histograma