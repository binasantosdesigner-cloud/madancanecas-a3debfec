
-- Verificando GRANTS via SQL direto
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT grantee, privilege_type 
              FROM information_schema.role_table_grants 
              WHERE table_schema = 'public' AND table_name = 'products')
    LOOP
        RAISE NOTICE 'Grantee: %, Privilege: %', r.grantee, r.privilege_type;
    END LOOP;
END $$;
