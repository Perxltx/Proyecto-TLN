from lector_imagen import leer_pgm
from caracteristicas import promedio, desviacion_estandar
from modelo import predecir

def localizar_ojo(pixeles, inicio_x, fin_x, alto, umbral=70):
    centro_x = 0
    centro_y = 0
    cantidad = 0

    for y in range(alto):
        for x in range(inicio_x, fin_x):
            p = pixeles[y][x]
            
            if isinstance(p, list) or isinstance(p, tuple):
                gris = int(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2])
            else:
                gris = p
                
            if gris < umbral:
                centro_x += x
                centro_y += y
                cantidad += 1

    if cantidad == 0:
        return None, None

    return int(centro_x / cantidad), int(centro_y / cantidad)

def segmentar_rostro(pixeles, ancho, alto):
    mitad_x = ancho // 2
    
    cx_der, cy_der = localizar_ojo(pixeles, 0, mitad_x, alto)
    cx_izq, cy_izq = localizar_ojo(pixeles, mitad_x, ancho, alto)
    
    return (cx_der, cy_der), (cx_izq, cy_izq)

def recortar_region(pixeles, cx, cy, tamano, ancho_max, alto_max):
    if cx is None or cy is None:
        return []

    recorte = []
    inicio_y = max(0, cy - tamano)
    fin_y = min(alto_max, cy + tamano)
    inicio_x = max(0, cx - tamano)
    fin_x = min(ancho_max, cx + tamano)

    for y in range(inicio_y, fin_y):
        fila = []
        for x in range(inicio_x, fin_x):
            fila.append(pixeles[y][x])
        recorte.append(fila)

    return recorte

def extraer_caracteristicas(recorte):
    grises = []
    
    for fila in recorte:
        for p in fila:
            if isinstance(p, list) or isinstance(p, tuple):
                grises.append(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2])
            else:
                grises.append(p)
                
    if not grises:
        return [0, 0]

    x1 = desviacion_estandar(grises)
    med = promedio(grises)
    
    anomalos = 0
    for g in grises:
        if abs(g - med) > (x1 * 2.5):
            anomalos += 1
            
    x2 = (anomalos / len(grises)) * 100
    
    return [x1, x2]

def analizar_imagen_completa(ruta_imagen, pesos, sesgo):
    imagen = leer_pgm(ruta_imagen)
    ancho = imagen["ancho"]
    alto = imagen["alto"]
    pixeles = imagen["pixeles"]

    coord_der, coord_izq = segmentar_rostro(pixeles, ancho, alto)

    ojo_der = recortar_region(pixeles, coord_der[0], coord_der[1], 50, ancho, alto)
    ojo_izq = recortar_region(pixeles, coord_izq[0], coord_izq[1], 50, ancho, alto)

    caract_der = extraer_caracteristicas(ojo_der)
    caract_izq = extraer_caracteristicas(ojo_izq)

    prob_der = predecir(caract_der, pesos, sesgo)
    prob_izq = predecir(caract_izq, pesos, sesgo)

    def evaluar_estado(probabilidad):
        if probabilidad > 0.65:
            return "Anomalía neurodegenerativa detectada"
        return "Tejido ocular sano / Irregularidad nativa"

    return {
        "ojo_derecho": {
            "varianza": round(caract_der[0], 2),
            "manchas": round(caract_der[1], 2),
            "probabilidad": round(prob_der * 100, 2),
            "estado": evaluar_estado(prob_der)
        },
        "ojo_izquierdo": {
            "varianza": round(caract_izq[0], 2),
            "manchas": round(caract_izq[1], 2),
            "probabilidad": round(prob_izq * 100, 2),
            "estado": evaluar_estado(prob_izq)
        }
    }

if __name__ == "__main__":
    pesos_entrenados = [0.45, 1.12] 
    sesgo_entrenado = -0.5
    
    resultado = analizar_imagen_completa("alzh.pgm", pesos_entrenados, sesgo_entrenado)
    print(resultado)