# KPL Future Gazette 🗞️

Actividad de equipo: imagina el futuro de KPL y la IA lo escribe como noticia.

---

## 🚀 Deploy en Vercel (paso a paso)

### Paso 1 — Obtén tu API Key de Anthropic

1. Ve a https://console.anthropic.com
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** → **Create Key**
4. Copia la key (empieza con `sk-ant-...`)
5. Agrega créditos en **Billing** → con $5 USD tienes más que suficiente para la actividad

---

### Paso 2 — Sube el código a GitHub

1. Ve a https://github.com y crea una cuenta si no tienes
2. Clic en **New repository**
3. Nómbralo `kpl-gazette`, déjalo **Private**
4. Clic en **Create repository**
5. En la página del repo verás instrucciones — usa la opción **"upload an existing file"**
6. Arrastra TODA la carpeta `kpl-gazette` ahí
7. Clic en **Commit changes**

---

### Paso 3 — Deploy en Vercel

1. Ve a https://vercel.com y crea cuenta con tu GitHub
2. Clic en **Add New → Project**
3. Selecciona el repo `kpl-gazette`
4. Antes de hacer deploy, ve a **Environment Variables** y agrega:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** tu key de Anthropic (`sk-ant-...`)
5. Clic en **Deploy**
6. En ~2 minutos tendrás tu link: `kpl-gazette.vercel.app`

---

### Paso 4 — Comparte con el equipo

Copia el link de Vercel y envíalo por WhatsApp.  
**Nadie necesita cuenta de Claude ni de nada.**  
La API key queda guardada en Vercel de forma segura, nadie la ve.

---

## 💰 Costo estimado

Con 15 personas generando 1 artículo cada una + 1 síntesis:
- ~16 llamadas a Claude Sonnet
- Costo estimado: **menos de $0.50 USD**

---

## ❓ ¿Problemas?

- **Error 401:** La API key está mal escrita en Vercel
- **Error 500:** Revisa que la key tenga créditos en console.anthropic.com
- **Artículos no aparecen en tiempo real:** Normal, se sincronizan cada 5 segundos
