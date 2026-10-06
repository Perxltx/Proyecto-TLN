def sigmoide(x):

    if x < -60:
        return 0

    if x > 60:
        return 1

    return 1 / (1 + aproximacion_exponencial(-x))


def aproximacion_exponencial(x):

    termino = 1
    resultado = 1

    for i in range(1, 30):

        termino = termino * x / i

        resultado = resultado + termino

    return resultado


def predecir(caracteristicas, pesos, sesgo):

    suma = sesgo

    for i in range(len(caracteristicas)):

        suma = suma + caracteristicas[i] * pesos[i]

    return sigmoide(suma)