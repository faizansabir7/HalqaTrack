# Supabase Setup Instructions

1.  **Create Project**: Go to [supabase.com](https://supabase.com), sign up/login, and create a new project.
2.  **Run Schema**:
    - Go to the **SQL Editor** in your Supabase dashboard.
    - Copy the contents of `supabase_schema.sql` (found in your project root) and paste it into the editor.
    - Click **Run**.
3.  **Get Credentials**:
    - Go to **Project Settings** -> **API**.
    - Copy the `Project URL` and `anon public` key.
4.  **Configure Environment**:
    - Create a file named `.env` in the root of your project (same level as `package.json`).
    - Add the following lines:
        ```
        VITE_SUPABASE_URL=your_project_url_here
        VITE_SUPABASE_ANON_KEY=your_anon_key_here
        ```
5.  **Restart Server**: If your dev server is running, restart it to pick up the env vars.
