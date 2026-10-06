from lector_imagen import cargar_pgm
from caracteristicas import extraer_caracteristicas
from modelo import predecir


def entrenar(X, Y, epocas, tasa):

    numero_caracteristicas = len(X[0])

    pesos = []

    for i in range(numero_caracteristicas):

        pesos.append(0)

    sesgo = 0

    for epoca in range(epocas):

        error_total = 0

        for ejemplo in range(len(X)):

            caracteristicas = X[ejemplo]

            real = Y[ejemplo]

            prediccion = predecir(
                caracteristicas,
                pesos,
                sesgo
            )

            error = real - prediccion

            error_total = error_total + abs(error)

            for j in range(numero_caracteristicas):

                pesos[j] = pesos[j] + (
                    tasa *
                    error *
                    caracteristicas[j]
                )

            sesgo = sesgo + tasa * error

        if epoca % 100 == 0:

            print(
                "Epoca:",
                epoca,
                "Error:",
                error_total
            )

    return pesos, sesgo