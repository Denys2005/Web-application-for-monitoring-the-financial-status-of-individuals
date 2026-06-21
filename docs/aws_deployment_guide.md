# Розгортання FinCash на AWS

Цей посібник містить кроки для запуску вашого сервера та фронтенду на хмарній платформі Amazon Web Services (AWS).

## 1. Архітектура
Для стабільної роботи рекомендується така структура:
- **База даних:** AWS RDS (PostgreSQL)
- **Бекенд (Server):** AWS App Runner (найпростіший варіант) або EC2.
- **Фронтенд (Client):** AWS Amplify або S3 + CloudFront.

---

## 2. Підготовка бази даних (AWS RDS)
Бекенд використовує PostgreSQL, тому найкращим вибором буде керований сервіс RDS.

1. Зайдіть в консоль AWS -> **RDS**.
2. Створіть нову базу даних:
   - **Engine:** PostgreSQL.
   - **Templates:** Free Tier (якщо доступно) або Dev/Test.
   - **Settings:** Вкажіть `DB instance identifier`, `Master username` та `Master password`.
3. У розділі **Connectivity**:
   - `Public access`: Yes (якщо хочете підключатися з дому) або No (для безпеки, тоді знадобиться налаштування VPC).
4. Після створення бази скопіюйте **Endpoint**. Ваш `DATABASE_URL` буде виглядати так:
   `postgresql://USER:PASSWORD@ENDPOINT:5432/DB_NAME`

---

## 3. Розгортання бекенду (AWS App Runner)
Ми вже створили `Dockerfile` у папці `backend`. AWS App Runner може автоматично зібрати образ і запустити його.

### Крок А: GitHub
1. Завантажте ваш код на GitHub.
2. В консолі AWS знайдіть **App Runner**.
3. Натисніть **Create service**.
4. Виберіть **Source code repository** та підключіть свій GitHub.

### Крок Б: Налаштування
1. **Runtime:** Виберіть Docker (App Runner сам знайде ваш Dockerfile).
2. **Port:** 5000 (або той, що вказаний у вашому .env).

### Крок В: Змінні оточення (Environment Variables)
Вкажіть наступні змінні в налаштуваннях App Runner:
- `DATABASE_URL`: (з кроку 2)
- `JWT_SECRET`: (випадковий рядок)
- `ACCESS_TOKEN_SECRET`: (випадковий рядок)
- `GEMINI_API_KEY`: (ваш ключ Google AI)
- `NODE_ENV`: `production`

---

## 4. Розгортання фронтенду (AWS Amplify)
Це найшвидший спосіб для React/Vite додатків.

1. В консолі AWS знайдіть **AWS Amplify**.
2. Виберіть **Amplify Hosting** -> **Deploy without Git** (або підключіть GitHub).
3. Якщо через GitHub:
   - Виберіть репозиторій та папку `frontend`.
   - Amplify автоматично визначить налаштування збірки (`npm run build`).
4. **Важливо:** У налаштуваннях Amplify додайте змінну оточення:
   - `VITE_API_URL`: URL вашого бекенду (який ви отримаєте від App Runner).

---

## 5. Що потрібно мати (Checklist)
- [ ] Акаунт AWS з прив'язаною картою.
- [ ] Ключ API для Gemini (ви вже маєте в .env).
- [ ] Код завантажений на GitHub (бажано).
- [ ] Налаштовані Security Groups в AWS (щоб бекенд міг "бачити" базу даних).

> [!TIP]
> Якщо ви хочете максимально зекономити, можна використовувати один **EC2 t3.micro** інстанс і запустити все через `docker-compose`, але це вимагає більше ручного налаштування Linux та Nginx.
