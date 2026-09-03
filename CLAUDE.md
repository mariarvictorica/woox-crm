# WooX CRM

CRM en español para empresas de venta de pinturas y materiales de construcción
en México. **Es un prototipo de alta fidelidad para revisiones con cliente**, no
un producto en producción: se lo juzga por cómo comunica el flujo, no por
integridad de datos.

Para el contexto de producto y de diseño —qué hace la app, los tres roles, el
vocabulario exacto, el sistema visual— leé [DESIGN-CONTEXT.md](DESIGN-CONTEXT.md).
Este archivo es lo técnico: lo que hay que saber para no romper nada ni redescubrir
lo mismo.

## Correr la app

El dev server está declarado en `.claude/launch.json` como **`woox-crm-preview`**,
puerto 3100. Levantalo con la herramienta de preview, **nunca con Bash**.

```
npm install
npx tsc --noEmit    # también: npm run lint
npx vite build
```

`npm run dev` usa el 3000, que suele estar ocupado — de ahí el 3100.

## Arquitectura, en tres hechos

**No hay backend.** Todo el estado vive en `src/App.tsx` con `useState`, sembrado
desde `src/data/initialData.ts`. Se resetea con cada recarga. No hay persistencia
entre sesiones ni entre dispositivos; cuando algo "tiene que persistir", el
máximo posible hoy es un campo en el registro del usuario en memoria.

**No hay router.** La navegación es `currentView: ViewType`, estado en `App.tsx`.
No hay URLs, ni deep links, ni botón de atrás. Todo destino tiene que ser
alcanzable desde la interfaz. Las pantallas de sesión (login, primer ingreso) son
hermanos mutuamente excluyentes bajo `.app-container`, no rutas.

**No hay carpeta `lib/`.** Por convención los helpers compartidos viven en
`src/data/initialData.ts`, junto a la semilla: `formatMoney`, `splitPhone`,
`joinPhone`, `digitsOnly`, `capitalizeFirst`, `getUserMissingFields`,
`getOrgMissingFields`, `monthRange`, `getStageBreakdown`. Antes de escribir un
helper, buscá ahí.

## ⚠️ `tsconfig` no tiene `strict`

`tsc --noEmit` **no detecta props obligatorias faltantes en JSX**. Un componente
nuevo mal cableado compila igual.

**La verificación real es el navegador.** Typecheck y build limpios no son
evidencia de que algo funcione. Este proyecto ya tuvo bugs que pasaron los dos:
una sección que quedaba montada con opacidad 0 ocupando espacio, y un eje que
parecía dinámico y no se movía nunca.

## Cuentas y roles

Contraseña única para todas: **`demo1234`** (`DEMO_PASSWORD` en `initialData.ts`).

| Rol | Cuenta | Puerta de login |
|---|---|---|
| Super Admin | `enrique@woox.mx` | App Admin |
| Manager / Owner | `pedro@garin.mx` | Manager |
| Representante | `maria@garin.mx` | Representante de Ventas |

Cada puerta acepta **solo** cuentas de su rol; entrar por la equivocada tiene que
fallar, o la separación es decorativa. Cualquier usuario de `users` puede entrar,
no solo los tres demo — es lo que hace demostrable el flujo de invitación.

Ojo con los dos ejes de rol: `UserMember.role` es el organigrama
(`'Rep' | 'Manager' | 'Super Admin (SA)'`) y `PlatformRole` es lo que la sesión
puede hacer (`'manager' | 'rep' | 'superadmin'`). `platformRoleFor()` traduce.

**Owner ≠ Manager.** Owner es únicamente quien se crea junto con la organización
(`organization.ownerId`). Un Manager agregado después a una organización existente
es Manager de equipo, sin acceso a "Mi organización". Hay un diálogo de traspaso
de Owner, así que el modelo asume un Owner único y explícito.

## Design systems: todo desde tokens

La app se renderiza en **tres** sistemas intercambiables (`hp`, `dublinks`,
`seline`) sobre los mismos ~88 tokens CSS, vía `html[data-design-system='…']`.

**Un color, radio, sombra o espaciado literal rompe los otros dos.** Siempre
`var(--token)`.

Seline tiene una regla propia: **badges con relleno y sin borde**. Cualquier clase
nueva tipo badge hay que sumarla a su bloque de override en `woox.css`, o se ve
distinta ahí.

Verificá siempre en los tres antes de dar algo por terminado.

## Componentes compartidos — reusar, no reescribir

Estos ya existen y concentran reglas que no conviene duplicar:

- **`FormField`** — el único patrón de campo. Label persistente, `*` u `(opcional)`,
  y una línea de altura reservada para el error, así mostrarlo no desplaza nada.
- **`TextField`** — input o textarea que **capitaliza la primera letra** mientras
  se tipea. Solo la primera: title-case rompería "de la Cruz".
- **`PhoneField`** — código de país + número, **solo dígitos**, preservando la
  posición del cursor cuando filtra un carácter.
- **`Dialog`** — modal o drawer, con focus trap. **No se puede impedir que cierre**;
  para algo bloqueante, pantalla completa fuera del layout `.app`.
- **`PendingZone`** — donde van las secciones "pendientes", primeras en la pantalla.
- **`UserAvatar`** — iniciales como fallback. Pasá `ignoreStoredPhoto` en previews
  de formulario, o muestra la foto del directorio en vez del valor del campo.

Un formulario nuevo hereda las reglas de teléfono y capitalización solo por usar
`PhoneField` y `TextField`.

## Trampas que ya costaron tiempo

**`localStorage` sobrevive a los reloads.** Ya generó dos veces un falso "no puedo
ver los cambios". Al terminar de probar, limpialo — y si guardás algo ahí,
scopealo por usuario u organización: una clave global filtra el estado de un
usuario al siguiente.

**HMR conserva el estado de React.** `useState(CONSTANTE)` solo lee su valor
inicial al montar, así que cambiar la constante no se refleja hasta recargar. Si
algo "no toma el cambio", recargá antes de investigar.

**El autocompletado del navegador escribe en los formularios.** Ya renombró un
tenant solo. Los formularios de organización llevan `autoComplete="off"`.

**`.focus()` por JS no hace que `:focus` matchee** mientras el panel no tiene el
foco real. Medir estilos de foco así da falsos negativos.

**El vínculo organización↔usuario es por *nombre***, no por id: `UserMember.organization`
guarda el string. Se filtra por él en cinco lugares (`App.tsx`, `OrganizationDetailView`,
`UserDetailView`, `UsersTable`). Renombrar una organización **tiene que propagarse**
a sus miembros o quedan huérfanos — `handleUpdateOrganization` ya lo hace.

**El tipo de cuenta de un contacto se deriva de la empresa.** Los dos formularios
que escriben un contacto hacen `type: company.trim() ? 'Empresa' : 'Particular'`.
Vaciar la empresa lo convierte en Particular, sin avisar.

## Problemas conocidos (no los introdujiste vos)

Verificados y todavía presentes:

- **`DashboardView.tsx:430`** — el título dice "Panel del Manager" para todos los
  roles. Un Rep ve el nombre de un puesto que no es el suyo.
- **`DashboardView.tsx:146`** — el gráfico de ganadas filtra sobre `opportunities`
  y no sobre `scopedOpps`: es el único bloque del dashboard **sin scope por rol**,
  así que un Rep ve las ganadas de toda la organización.
- **A 375px el sidebar sigue midiendo 240px**, dejando el contenido en ~135px.
  Comprime todos los bloques por igual; el gráfico además desborda.
- Warning de React por mezclar `flex` y `flexShrink` inline en
  `OrgProfileChecklistBanner`.

## Cómo se verifica acá

Antes de decir que algo está listo:

1. Probarlo en el navegador con **cada rol al que aplique**, no solo uno.
2. Recorrer los **tres design systems**.
3. Medir en vez de suponer: geometría, colores computados, orden del DOM. Varios
   bugs de este proyecto solo aparecieron midiendo.
4. **Limpiar el estado de prueba**: los usuarios y organizaciones creados se van
   con un reload, las claves de `localStorage` no.
5. `npx tsc --noEmit` y `npx vite build` limpios — necesario, nunca suficiente.

## Git

`gh` no está instalado y no hay `GH_TOKEN`, así que **no se pueden crear PRs desde
acá**. El remoto está en HTTPS sin credenciales; **el push funciona solo por SSH**:

```
git push git@github.com:mariarvictorica/woox-crm.git <rama>
```
