# WooX CRM — Contexto para diseño

## Qué es
CRM web en español para empresas de venta de pinturas y materiales de
construcción en México. Equipos comerciales chicos: un Manager con 2 a 10
vendedores. Multi-tenant, con un administrador de la plataforma por encima.

El trabajo que hace: **que ningún contacto se enfríe y ninguna oportunidad se
pierda por falta de seguimiento.** No es reporting para dirección. Es la
pantalla que un vendedor abre a la mañana para saber a quién llamar.

Los usuarios no son técnicos: vendedores de mostrador y de calle, gerentes de
sucursal, dueños de pinturerías. Vienen de WhatsApp y Excel.

## Tres usuarios, tres experiencias
- **Representante de Ventas** — ve solo su propio trabajo. Sin equipo, sin
  comparaciones, sin totales de la organización. Navegación: Dashboard,
  Contactos, Oportunidades.
- **Manager** — ve toda su organización y gestiona el equipo. Navegación: los 3
  anteriores + Usuarios + Mi organización.
- **Super Admin** — administra la plataforma, **no pertenece a ninguna
  organización**. Crea organizaciones y usuarios. Nunca ve contactos ni
  oportunidades de nadie. Arranca en Organizaciones, no en un dashboard.

La separación entre "la plataforma" y "una empresa cliente" tiene que ser
legible a simple vista.

## Objetos
**Contacto** — persona o empresa a la que se le puede vender. Campos visibles
que importan: giro (Hotelería, Construcción, Retail, Arquitectura), región,
origen (B2B, Retail, Online, Referido, Instagram, WhatsApp, Facebook, TikTok),
**Prioritario** (píldora redonda con estrella, la marca más importante de la
lista), días de inactividad (+7 = necesita seguimiento), vendedor asignado.

**Oportunidad** — un negocio concreto con un contacto; puede haber varias por
contacto. Valor en pesos (puede ser nulo si no se cotizó), fecha de cierre,
vendedor, y **etapa**, que es el eje central de la app:

| Etapa | Estado | Color |
|---|---|---|
| Nuevo | abierta | gris |
| Contactado | abierta | ámbar |
| Calificado | abierta | azul |
| Negociación | abierta | naranja |
| Ganado | cerrada | verde |
| Perdido | cerrada | rojo |

La distinción abierta/cerrada aparece en filtros y métricas por todas partes.

**Nota** — comentarios con adjuntos sobre un contacto, opcionalmente
etiquetados a una oportunidad. Editables solo 24 horas. Es la memoria real de
la relación y el campo más usado.

**Usuario / Organización** — un usuario pertenece a una organización con rol
Manager o Representante. Estados: Activo, Inactivo, Invitado (dado de alta,
nunca entró).

## Estructura
Barra superior fina, sidebar izquierdo colapsable con el perfil abajo, área de
contenido. Sin tabs. Listado con buscador y filtros → detalle en pantalla
completa (no modal). Formularios en drawers laterales; modales solo para
confirmar. Escritorio primero; aguanta 375px sin desbordar.

**Regla general: lo pendiente va primero.** En cualquier pantalla, toda sección
que reclame una acción del usuario —perfil incompleto, datos de la empresa sin
cargar, cola de seguimiento— se agrupa arriba, inmediatamente después del
encabezado y antes de cualquier lista, tabla o número. Si no hay ninguna, el
contenido arranca sin dejar hueco. Vale para todos los roles.

**El dashboard está ordenado por urgencia, no por jerarquía de datos:**
1. Avisos de configuración pendiente — datos de la empresa, perfil personal
2. "Necesita tu atención" — cola de filas accionables, cada una lleva a la lista
   ya filtrada
3. KPIs, gráfico de ganadas por mes, pipeline por etapa (cada fila filtra)
4. Rendimiento del equipo (solo Manager), actividad reciente

## Vocabulario — usar exacto, no traducir
| Concepto | Etiqueta |
|---|---|
| Lead / prospecto | **Contacto** |
| Deal | **Oportunidad** |
| Sales rep | **Representante de Ventas** (con "de") |
| Industria | **Giro** |
| Tax ID | **RFC** |
| Marcado como importante | **Prioritario** |
| Empresa cliente | **Organización** |

Español con voseo suave en instrucciones: "Completá tu perfil", "Escribí el
nombre". Errores en frases directas, nunca códigos. Moneda `$311,500`.

## Sistema visual
Se renderiza en **tres design systems intercambiables** sobre los mismos ~88
tokens CSS. **Todo color, radio, sombra y espaciado sale de tokens** — un valor
literal rompe los otros dos.

Base: primary `#024ad8`, texto `#1a1a1a` sobre blanco, canvas `#f7f7f7`, bordes
`#e8e8e8`. Semánticos: éxito `#1a8e3e`, atención `#d97706`, crítico `#b3262b`.

Forma en dos niveles: interactivos 4px, contenedores 16px, píldoras completas.
Elevación contenida — hairline de 1px como estructura principal, sombra suave
solo en tarjetas. Densidad alta; el aire va entre bloques, no dentro de las
filas. Movimiento mínimo, 150–180ms.

Tipografía: base 14px, botones 14px sin mayúsculas forzadas, labels de sección
11px en mayúsculas. **Para texto de cuerpo usar 16px** (decisión tomada, aún no
implementada).

Los otros dos sistemas: **Dublinks** casi monocromo y más plano; **Seline** cian
con radios generosos y una regla propia — **badges con relleno, sin borde**.

## Lo que hace que un diseño funcione acá
- **El usuario busca su próxima acción, no datos.** Información sin decir qué
  hacer con ella está a medias. Cada número lleva a la lista que lo produjo.
- **Ninguna métrica porque exista en la base.** Si no cambia una decisión, no va.
- **Lo pendiente va arriba y agrupado**, antes de cualquier lista o número:
  primero los avisos de configuración, después la cola de seguimiento. Ámbar si
  la organización lo necesita para funcionar, acento ámbar y descartable si es
  personal. Un aviso permanente se vuelve mobiliario, así que lo personal se
  puede cerrar para siempre.
- **Un estado bloqueante siempre necesita salida.** Si una pantalla toma el
  control y tapa el sidebar, lleva su propio "Cerrar sesión".
- **Lo opcional es opcional de verdad.** Puesto, teléfono y foto nunca bloquean
  una tarea; dar de alta a alguien tiene que tomar diez segundos. Lo que falta
  se pide después.
- **Las listas son largas y se recorren buscando algo puntual.** Buscador
  siempre visible; Prioritario, etapa y días de inactividad se leen sin entrar
  al detalle.
- **Un error dice qué hacer** y nunca falla en silencio: si un archivo se
  rechaza, se dice por qué.
- **Cero jerga de software.** "Etapa", no "pipeline stage". Si un concepto
  necesita explicación, necesita otro nombre.

## Estado
Prototipo de alta fidelidad para revisiones con cliente. Sin backend: los datos
viven en memoria. Sin navegación por URL — todo destino se alcanza desde la
interfaz, no hay deep links ni botón de atrás.
