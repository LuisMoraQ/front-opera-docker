// formula-evaluator.service.ts
import { Injectable } from '@angular/core';

interface filaPresAnalitico {
  id_presupuesto: number;
  id_proyecto: number;
  id_area: number;
  item: string;
  descripcion: string;
  abreviatura: string;
  formula: string;
  cargos: cargoFila[];
}

interface cargoFila {
  id_cargo: number;
  porcentaje: number | null;
  parcial: number;
}

@Injectable({
  providedIn: 'root'
})
export class FormulaEvaluatorService {
  obtenerDependencias(formula: string): string[] {
    return this.extraerDependencias(formula);
  }

  // Método privado que usa obtenerDependencias internamente

  // Evaluar todas las fórmulas en orden
  evaluarTodasFormulas(tabla: filaPresAnalitico[]): void {
    if (!tabla || tabla.length === 0) return;

    // 1. Establecer los valores base (fila 0)
    const filaBase = tabla[0];
    if (filaBase) {
      // La fila base no tiene fórmula, sus valores parciales son directos
      // Se establecen manualmente
    }

    // 2. Construir mapa de dependencias
    const dependencias = this.construirDependencias(tabla);

    // 3. Verificar que no haya ciclos
    if (this.detectarCiclos(dependencias)) {
      console.error('¡Ciclo detectado en las fórmulas!');
      return;
    }

    // 4. Ordenar por dependencias (orden topológico)
    const ordenEvaluacion = this.ordenarPorDependencias(tabla, dependencias);

    // 5. Evaluar cada fila en el orden correcto
    ordenEvaluacion.forEach(indice => {
      if (indice > 0) { // No evaluar fila base
        this.evaluarFila(tabla, indice);
      }
    });
  }

  evaluarFila(tabla: filaPresAnalitico[], filaIndex: number): void {
    const fila = tabla[filaIndex];



    if (filaIndex === 0 || !fila.formula) {
      return;
    }

    // Para cada cargo en la fila
    fila.cargos.forEach((cargo, cargoIndex) => {

      if (cargo.porcentaje !== null) {
        const resultado = this.evaluarFormulaParaCargo(
          fila.formula,
          cargo.porcentaje,
          fila.abreviatura,
          tabla,
          cargoIndex
        );

        cargo.parcial = resultado;
      } else {
        cargo.parcial = 0;
      }
    });

  }
  // Método principal para evaluar fórmulas
  private evaluarFormulaParaCargo(
    formula: string,
    porcentaje: number,
    abreviaturaActual: string,
    tabla: filaPresAnalitico[],
    cargoIndex: number
  ): number {
    if (!formula) return 0;

    try {

      let expresion = formula;

      // 1. Reemplazar %ABREV y %*ABREV
      const regexPorcentajeAbrev = /%\*?([A-Z0-9]{2,})/g;
      let match;
      let cambios = false;

      do {
        cambios = false;
        match = regexPorcentajeAbrev.exec(expresion);

        if (match) {
          const fullMatch = match[0]; // %RB o %*RB
          const abrevRef = match[1];  // RB


          // Obtener valor de la referencia
          const valorRef = this.obtenerValorDeReferencia(abrevRef, tabla, cargoIndex);

          if (valorRef > 0) {
            // %RB = (porcentaje/100) * valorRef
            const valorCalculado = (porcentaje / 100) * valorRef;

            expresion = expresion.replace(fullMatch, valorCalculado.toString());
            cambios = true;
          }

          // Reiniciar el regex
          regexPorcentajeAbrev.lastIndex = 0;
        }
      } while (cambios && regexPorcentajeAbrev.test(expresion));

      // 2. Reemplazar referencias directas (sin %) - OJO: esto puede causar problemas
      // Mejor comentar esto por ahora hasta que funcione lo básico
      /*
      const regexReferenciaDirecta = /(?<!%)([A-Z0-9]{2,})(?!\d)/g;
      cambios = false;
      do {
          cambios = false;
          match = regexReferenciaDirecta.exec(expresion);
          
          if (match) {
              const abrevRef = match[1];
              
              // Evitar autorreferencia
              if (abrevRef === abreviaturaActual) {
                  throw new Error(`Referencia circular a sí misma: ${abrevRef}`);
              }
              
              const valorRef = this.obtenerValorDeReferencia(abrevRef, tabla, cargoIndex);
              
              if (valorRef > 0) {
                  expresion = expresion.replace(abrevRef, valorRef.toString());
                  cambios = true;
              }
              
              regexReferenciaDirecta.lastIndex = 0;
          }
      } while (cambios && regexReferenciaDirecta.test(expresion));
      */

      // 3. Reemplazar % solo (sin abreviatura)
      // Buscar % que no esté seguido de letras/números
      if (expresion.includes('%')) {
        const regexPorcentajeSolo = /%(?![A-Z0-9])/g;
        expresion = expresion.replace(regexPorcentajeSolo, (porcentaje / 100).toString());
      }


      // 4. Limpiar la expresión - SOLO dejar números, operadores y paréntesis
      // Primero eliminar cualquier letra que haya quedado
      expresion = expresion.replace(/[A-Za-z]/g, '');

      // Luego limpiar espacios y caracteres extra
      expresion = expresion
        .replace(/\s+/g, '')
        .replace(/[^0-9+\-*/().]/g, '') // Solo caracteres matemáticos válidos
        .replace(/(\d+)%/g, '$1/100')   // Convertir n% a n/100
        .trim();


      if (!expresion || expresion === '') {
        return 0;
      }

      // 5. Verificar que sea una expresión válida
      if (!this.esExpresionValida(expresion)) {
        return 0;
      }

      // Evaluación segura
      const resultado = this.evaluarExpresion(expresion);

      return isNaN(resultado) ? 0 : parseFloat(resultado.toFixed(2));

    } catch (error) {
      console.error('Error evaluando fórmula:', formula, error);
      return 0;
    }
  }

  private esExpresionValida(expresion: string): boolean {
    if (!expresion) return false;

    // Verificar que no empiece o termine con operador
    if (/^[+\-*/]|[+\-*/]$/.test(expresion)) {
      return false;
    }

    // Verificar que no tenga operadores duplicados
    if (/[+\-*/]{2,}/.test(expresion)) {
      return false;
    }

    // Verificar que los paréntesis estén balanceados
    const stack = [];
    for (const char of expresion) {
      if (char === '(') {
        stack.push(char);
      } else if (char === ')') {
        if (stack.length === 0) return false;
        stack.pop();
      }
    }

    return stack.length === 0;
  }

  // Obtener valor de una referencia
  private obtenerValorDeReferencia(
    abreviatura: string,
    tabla: filaPresAnalitico[],
    cargoIndex: number
  ): number {
    const filaRef = tabla.find(f => f.abreviatura === abreviatura);

    if (!filaRef || !filaRef.cargos[cargoIndex]) {
      console.warn(`Referencia no encontrada: ${abreviatura} para cargo ${cargoIndex}`);
      return 0;
    }

    return filaRef.cargos[cargoIndex].parcial || 0;
  }

  // Evaluar expresión matemática de forma segura
  private evaluarExpresion(expresion: string): number {
    try {
      // Verificar que la expresión sea segura
      if (!/^[0-9+\-*/().\s]+$/.test(expresion)) {
        throw new Error('Expresión contiene caracteres no válidos');
      }

      // Usar Function constructor para evaluación segura
      const evaluar = new Function('return ' + expresion);
      const resultado = evaluar();

      return typeof resultado === 'number' ? resultado : 0;
    } catch (error) {
      console.error('Error evaluando expresión:', expresion, error);
      return 0;
    }
  }

  // Construir mapa de dependencias
  private construirDependencias(tabla: filaPresAnalitico[]): Map<string, string[]> {
    const dependencias = new Map<string, string[]>();

    tabla.forEach(fila => {
      if (fila.formula && fila.abreviatura) {
        const deps = this.extraerDependencias(fila.formula);
        dependencias.set(fila.abreviatura, deps);
      }
    });

    return dependencias;
  }

  // Extraer dependencias de una fórmula
  private extraerDependencias(formula: string): string[] {
    if (!formula) return [];

    // Buscar todas las abreviaturas en la fórmula (con o sin %)
    const regex = /%?([A-Z0-9]{2,})/g;
    const matches = formula.match(regex) || [];

    // Extraer solo las abreviaturas (sin el %)
    const dependencias = matches.map(match =>
      match.startsWith('%') ? match.substring(1) : match
    );

    return [...new Set(dependencias)]; // Eliminar duplicados
  }

  // Detectar ciclos en las dependencias
  private detectarCiclos(dependencias: Map<string, string[]>): boolean {
    const visitados = new Set<string>();
    const enCamino = new Set<string>();

    const dfs = (abreviatura: string): boolean => {
      if (enCamino.has(abreviatura)) return true; // Ciclo detectado
      if (visitados.has(abreviatura)) return false;

      visitados.add(abreviatura);
      enCamino.add(abreviatura);

      const deps = dependencias.get(abreviatura) || [];
      for (const dep of deps) {
        if (dfs(dep)) return true;
      }

      enCamino.delete(abreviatura);
      return false;
    };

    for (const [abreviatura] of dependencias) {
      if (!visitados.has(abreviatura)) {
        if (dfs(abreviatura)) return true;
      }
    }

    return false;
  }

  // Ordenar por dependencias (orden topológico)
  private ordenarPorDependencias(
    tabla: filaPresAnalitico[],
    dependencias: Map<string, string[]>
  ): number[] {

    const orden: number[] = [];
    const procesados = new Set<number>();

    // Agregar fila base primero
    if (tabla.length > 0) {
      orden.push(0);
      procesados.add(0);
    }

    // Función para verificar si todas las dependencias están resueltas
    const dependenciasResueltas = (index: number): boolean => {
      const fila = tabla[index];
      if (!fila.formula) {
        return true;
      }

      const deps = dependencias.get(fila.abreviatura) || [];

      const resueltas = deps.every(dep => {
        const estaResuelta = tabla.some((f, i) => f.abreviatura === dep && procesados.has(i));
        return estaResuelta;
      });

      return resueltas;
    };

    // Ordenar el resto
    let cambio = true;
    let iteracion = 0;

    while (cambio && iteracion < 20) { // Limitar iteraciones por seguridad
      iteracion++;
      cambio = false;

      tabla.forEach((fila, index) => {
        if (!procesados.has(index)) {

          if (dependenciasResueltas(index)) {
            orden.push(index);
            procesados.add(index);
            cambio = true;
          }
        }
      });

      if (!cambio && procesados.size < tabla.length) {
        console.warn('Posible ciclo o dependencia circular no detectada');

        // Agregar las restantes en cualquier orden
        tabla.forEach((fila, index) => {
          if (!procesados.has(index)) {
            orden.push(index);
            procesados.add(index);
          }
        });
      }
    }


    return orden;
  }
}