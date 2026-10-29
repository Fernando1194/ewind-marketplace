-- Ewind demo: sample data and a reset function.
-- demo.reset() rebuilds every sample account and its data from scratch, with dates
-- relative to today, so the demo always looks current. pg_cron runs it every night.

CREATE SCHEMA IF NOT EXISTS demo;
REVOKE ALL ON SCHEMA demo FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION demo.upsert_user(p_id uuid, p_email text, p_password text, p_name text, p_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp AS $$
BEGIN
  DELETE FROM auth.users WHERE id = p_id OR email = p_email;
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', p_id, 'authenticated', 'authenticated', p_email,
    crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_name, 'role', p_role),
    now() - interval '60 days', now(), '', '', '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), p_id, p_id::text,
    jsonb_build_object('sub', p_id::text, 'email', p_email, 'email_verified', true),
    'email', now(), now(), now());
  -- handle_new_user() creates the profile; complete it
  UPDATE public.profiles SET full_name = p_name, role = p_role,
    is_host = (p_role = 'host'), is_supplier = (p_role = 'supplier'),
    lgpd_consent = true, lgpd_consent_at = now()
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION demo.reset()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp AS $$
DECLARE
  -- accounts
  u_demo  uuid := '0e0d0000-0000-4000-8000-000000000001';
  h_vale  uuid := '0e0d0000-0000-4000-8000-000000000011';
  h_cris  uuid := '0e0d0000-0000-4000-8000-000000000012';
  h_otto  uuid := '0e0d0000-0000-4000-8000-000000000013';
  s_luz   uuid := '0e0d0000-0000-4000-8000-000000000021';
  s_sabor uuid := '0e0d0000-0000-4000-8000-000000000022';
  s_dj    uuid := '0e0d0000-0000-4000-8000-000000000023';
  s_flor  uuid := '0e0d0000-0000-4000-8000-000000000024';
  -- spaces
  sp_vale  uuid := '0e0d5000-0000-4000-8000-000000000001';
  sp_cris  uuid := '0e0d5000-0000-4000-8000-000000000002';
  sp_otto  uuid := '0e0d5000-0000-4000-8000-000000000003';
  sp_pris  uuid := '0e0d5000-0000-4000-8000-000000000004';
  sp_ipe   uuid := '0e0d5000-0000-4000-8000-000000000005';
  sp_casa  uuid := '0e0d5000-0000-4000-8000-000000000006';
  sp_kids  uuid := '0e0d5000-0000-4000-8000-000000000007';
  sp_lago  uuid := '0e0d5000-0000-4000-8000-000000000008';
  -- suppliers
  su_luz   uuid := '0e0d6000-0000-4000-8000-000000000001';
  su_sabor uuid := '0e0d6000-0000-4000-8000-000000000002';
  su_dj    uuid := '0e0d6000-0000-4000-8000-000000000003';
  su_flor  uuid := '0e0d6000-0000-4000-8000-000000000004';
  su_doce  uuid := '0e0d6000-0000-4000-8000-000000000005';
  su_film  uuid := '0e0d6000-0000-4000-8000-000000000006';
  -- events
  ev_wed  uuid := '0e0d7000-0000-4000-8000-000000000001';
  ev_bday uuid := '0e0d7000-0000-4000-8000-000000000002';
  ev_corp uuid := '0e0d7000-0000-4000-8000-000000000003';
  wedding date := current_date + 150;
  img text := 'https://images.unsplash.com/photo-';
  q text := '?auto=format&fit=crop&w=1200&q=80';
  c_id uuid;
  cmp uuid;
  t_ids uuid[] := '{}';
  t uuid;
  i int;
  first_names text[] := ARRAY['Mariana','Lucas','Beatriz','Rafael','Camila','Gustavo','Larissa','Thiago','Juliana','Bruno',
    'Fernanda','Diego','Patrícia','Rodrigo','Aline','Felipe','Renata','Eduardo','Carolina','Marcelo',
    'Gabriela','André','Vanessa','Leonardo','Daniela','Ricardo','Natália','Fábio','Isabela','Vinícius',
    'Letícia','Henrique','Priscila','Mateus','Tatiane','Paulo','Bianca','Gabriel','Simone','Otávio'];
  last_names text[] := ARRAY['Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa','Rodrigues','Almeida','Nascimento',
    'Carvalho','Ribeiro','Martins','Rocha','Barbosa','Moreira','Teixeira','Mendes','Cardoso','Kowalski'];
  groups text[] := ARRAY['Família da noiva','Família do noivo','Amigos da faculdade','Trabalho da Ana','Trabalho do Pedro','Amigos de infância'];
BEGIN
  -- 1. Wipe everything the demo created (profiles cascade to all user data)
  DELETE FROM public.spaces WHERE id::text LIKE '0e0d5000%';
  DELETE FROM public.suppliers WHERE id::text LIKE '0e0d6000%';
  DELETE FROM auth.users WHERE id::text LIKE '0e0d0000%';
  -- accounts visitors created in the demo are removed after a day
  DELETE FROM auth.users WHERE created_at < now() - interval '1 day' AND id::text NOT LIKE '0e0d0000%';

  -- 2. Accounts
  PERFORM demo.upsert_user(u_demo, 'demo@ewind.com.br', 'ewind-demo', 'Ana Ribeiro', 'guest');
  PERFORM demo.upsert_user(h_vale, 'chacaravaleverde@demo.ewind.com.br', gen_random_uuid()::text, 'Chácara Vale Verde', 'host');
  PERFORM demo.upsert_user(h_cris, 'salaocristal@demo.ewind.com.br', gen_random_uuid()::text, 'Grupo Cristal Eventos', 'host');
  PERFORM demo.upsert_user(h_otto, 'domotto@demo.ewind.com.br', gen_random_uuid()::text, 'Dom Otto Gastronomia', 'host');
  PERFORM demo.upsert_user(s_luz, 'luzelente@demo.ewind.com.br', gen_random_uuid()::text, 'Luz & Lente Fotografia', 'supplier');
  PERFORM demo.upsert_user(s_sabor, 'saborearte@demo.ewind.com.br', gen_random_uuid()::text, 'Sabor & Arte Buffet', 'supplier');
  PERFORM demo.upsert_user(s_dj, 'djmarcos@demo.ewind.com.br', gen_random_uuid()::text, 'DJ Marcos Beat', 'supplier');
  PERFORM demo.upsert_user(s_flor, 'flordelis@demo.ewind.com.br', gen_random_uuid()::text, 'Flor de Lis Decorações', 'supplier');
  UPDATE public.profiles SET phone = '(41) 99876-5432' WHERE id = u_demo;

  -- 3. Spaces
  INSERT INTO public.spaces (id, host_id, name, description, category, event_types, city, state, neighborhood, capacity, min_hours,
    price_per_hour, price_per_day, attributes, media_urls, status, whatsapp, instagram, area_covered, area_uncovered, availability_note, created_at)
  VALUES
  (sp_vale, h_vale, 'Chácara Vale Verde',
   'Chácara com 12 mil m² de área verde, lago, capela ao ar livre e salão coberto com vista para o bosque. Muito procurada para casamentos de dia e cerimônias ao pôr do sol.',
   'Chácara', ARRAY['Casamento','Aniversário','Confraternização'], 'Curitiba', 'PR', 'Santa Felicidade', 250, 8, NULL, 6800,
   ARRAY['Estacionamento','Área externa','Lago / Lagoa','Churrasqueira','Pista de dança','Quarto para noivos','Cozinha equipada','Gerador de energia'],
   ARRAY[img||'1519225421980-715cb0215aed'||q, img||'1469371670807-013ccf25f16a'||q, img||'1607861884586-c7cfaed16290'||q],
   'active', '41999990101', '@chacaravaleverde', 600, 12000, 'Sábados de outubro a dezembro com alta procura.', now() - interval '40 days'),
  (sp_cris, h_cris, 'Salão Cristal',
   'Salão climatizado com pé-direito de 7 metros, lustres de cristal e iluminação cênica. Fica a 5 minutos do centro, com estacionamento coberto para 120 carros.',
   'Salão de Eventos', ARRAY['Casamento','Formatura','Debutante','Corporativo'], 'Curitiba', 'PR', 'Centro', 400, 5, 750, NULL,
   ARRAY['Estacionamento','Ar-condicionado','Pista de dança','Palco','Iluminação profissional','Som profissional','Camarim','Banheiro acessível'],
   ARRAY[img||'1519167758481-83f550bb49b3'||q, img||'1511795409834-ef04bbd61622'||q],
   'active', '41999990102', '@salaocristal', 900, NULL, NULL, now() - interval '35 days'),
  (sp_otto, h_otto, 'Restaurante Dom Otto',
   'Restaurante de culinária italiana com salão reservado para até 90 pessoas, adega própria e cardápio fechado para eventos. Ideal para jantares de ensaio e aniversários.',
   'Restaurante', ARRAY['Aniversário','Confraternização','Corporativo'], 'São José dos Pinhais', 'PR', 'Centro', 90, 4, 420, NULL,
   ARRAY['Estacionamento','Ar-condicionado','Wi-Fi','Buffet/Catering','Acessibilidade'],
   ARRAY[img||'1530023367847-a683933f4172'||q, img||'1502635385003-ee1e6a1a742d'||q],
   'active', '41999990103', '@domotto', 220, NULL, NULL, now() - interval '30 days'),
  (sp_pris, h_cris, 'Espaço Prisma Corporate',
   'Auditório para 180 pessoas e três salas modulares, com projeção, transmissão ao vivo e coffee break incluído nos pacotes de dia inteiro.',
   'Espaço Corporativo', ARRAY['Corporativo','Formatura'], 'Curitiba', 'PR', 'Batel', 180, 4, 560, 3900,
   ARRAY['Wi-Fi','Ar-condicionado','Som profissional','Palco','Estacionamento','Acessibilidade'],
   ARRAY[img||'1511578314322-379afb476865'||q],
   'active', '41999990104', '@prismacorporate', 450, NULL, NULL, now() - interval '28 days'),
  (sp_ipe, h_vale, 'Recanto dos Ipês',
   'Espaço rústico com galpão de madeira, jardim de ipês e área para cerimônia. Aceita fornecedores externos sem taxa de rolha.',
   'Chácara', ARRAY['Casamento','Aniversário','Festa Infantil'], 'Campo Largo', 'PR', 'Bateias', 180, 8, NULL, 5200,
   ARRAY['Área externa','Churrasqueira','Estacionamento','Pet friendly','Tenda inclusa'],
   ARRAY[img||'1670529776180-60e4132ab90c'||q, img||'1625038032515-308ab14d10b9'||q],
   'active', '41999990105', '@recantodosipes', 400, 8000, NULL, now() - interval '20 days'),
  (sp_casa, h_otto, 'Casa Batel Eventos',
   'Casarão histórico restaurado com jardim de inverno, para casamentos intimistas e recepções de até 120 convidados.',
   'Salão de Eventos', ARRAY['Casamento','Aniversário','Corporativo'], 'Curitiba', 'PR', 'Batel', 120, 5, 680, NULL,
   ARRAY['Ar-condicionado','Área externa','Cozinha equipada','Wi-Fi'],
   ARRAY[img||'1737682599438-319b61711b5f'||q, img||'1519225421980-715cb0215aed'||q],
   'active', '41999990106', '@casabatel', 350, 150, NULL, now() - interval '15 days'),
  (sp_kids, h_cris, 'Planeta Kids Buffet',
   'Buffet infantil com brinquedão, salão de jogos e monitores. Pacotes com decoração temática e cardápio infantil.',
   'Buffet Infantil', ARRAY['Festa Infantil','Aniversário'], 'Curitiba', 'PR', 'Água Verde', 120, 4, 390, NULL,
   ARRAY['Salão de jogos','Ar-condicionado','Buffet/Catering','Estacionamento'],
   ARRAY[img||'1530023367847-a683933f4172'||q],
   'active', '41999990107', '@planetakids', 300, NULL, NULL, now() - interval '10 days'),
  (sp_lago, h_vale, 'Pousada Lago Azul',
   'Pousada à beira do lago com 18 suítes para os convidados, ideal para casamentos de fim de semana inteiro.',
   'Pousada', ARRAY['Casamento','Confraternização'], 'Piraquara', 'PR', 'Borda do Campo', 140, 8, NULL, 9800,
   ARRAY['Lago / Lagoa','Piscina','Quarto para noivos','Estacionamento','Área externa'],
   ARRAY[img||'1712068534065-f56c36e21759'||q, img||'1727081203667-4792c134061a'||q],
   'active', '41999990108', '@pousadalagoazul', 300, 5000, NULL, now() - interval '5 days');

  INSERT INTO public.space_addresses (space_id, address, cep) VALUES
  (sp_vale, 'Rua Ângelo Zanchi, 1200', '82020-000'),
  (sp_cris, 'Rua XV de Novembro, 845', '80020-310'),
  (sp_otto, 'Rua Joinville, 2100', '83005-000');

  -- 4. Suppliers
  INSERT INTO public.suppliers (id, owner_id, name, description, category, subcategory, cities, state, neighborhood, whatsapp, instagram, email,
    price_info, media_urls, attributes, event_types, status, created_at)
  VALUES
  (su_luz, s_luz, 'Luz & Lente Fotografia', 'Fotografia documental de casamentos e eventos, com dois fotógrafos, pré-wedding e álbum digital entregue em 30 dias.',
   'Fotografia', 'Casamentos', ARRAY['Curitiba','São José dos Pinhais','Campo Largo'], 'PR', 'Batel', '41999990201', '@luzelente', 'contato@luzelente.demo',
   'A partir de R$ 4.900 (cobertura de 8 horas)', ARRAY[img||'1520854221256-17451cc331bf'||q, img||'1532712938310-34cb3982ef74'||q],
   ARRAY['Pré-wedding','Álbum digital','Dois fotógrafos'], ARRAY['Casamento','Aniversário','Corporativo'], 'active', now() - interval '38 days'),
  (su_sabor, s_sabor, 'Sabor & Arte Buffet', 'Buffet completo com equipe de serviço, cardápio de 5 tempos, opções vegetarianas e degustação para os noivos.',
   'Buffet / Catering', NULL, ARRAY['Curitiba','Colombo','Pinhais'], 'PR', 'Portão', '41999990202', '@saborearte', 'eventos@saborearte.demo',
   'R$ 165 a R$ 240 por convidado', ARRAY[img||'1555244162-803834f70033'||q, img||'1576842546422-60562b9242ae'||q],
   ARRAY['Degustação','Opções vegetarianas','Equipe de garçons'], ARRAY['Casamento','Corporativo','Formatura'], 'active', now() - interval '33 days'),
  (su_dj, s_dj, 'DJ Marcos Beat', 'DJ com 12 anos de pista, som e iluminação próprios e playlist montada junto com os noivos.',
   'Música / DJ', NULL, ARRAY['Curitiba','Colombo','Araucária'], 'PR', 'Centro', '41999990203', '@djmarcosbeat', NULL,
   'Pacotes a partir de R$ 2.800', ARRAY[img||'1470225620780-dba8ba36b745'||q],
   ARRAY['Som próprio','Iluminação de pista','Telão'], ARRAY['Casamento','Aniversário','Formatura','Debutante'], 'active', now() - interval '25 days'),
  (su_flor, s_flor, 'Flor de Lis Decorações', 'Decoração floral e cenográfica para cerimônias e recepções, com projeto 3D aprovado antes do evento.',
   'Decoração', NULL, ARRAY['Curitiba','Campo Largo','Piraquara'], 'PR', 'Mercês', '41999990204', '@flordelisdecor', NULL,
   'Projetos a partir de R$ 7.500', ARRAY[img||'1524777313293-86d2ab467344'||q, img||'1473973916745-60839aebf06b'||q],
   ARRAY['Projeto 3D','Flores naturais','Montagem e desmontagem'], ARRAY['Casamento','Debutante','Corporativo'], 'active', now() - interval '22 days'),
  (su_doce, s_flor, 'Doce Encanto Confeitaria', 'Bolos de casamento, doces finos e mesa de sobremesas. Degustação com até 4 sabores.',
   'Bolo & Confeitaria', NULL, ARRAY['Curitiba'], 'PR', 'Água Verde', '41999990205', '@doceencanto', NULL,
   'Bolo a partir de R$ 18 por fatia', ARRAY[img||'1653821355226-6def361cc7ab'||q],
   ARRAY['Degustação','Doces finos'], ARRAY['Casamento','Aniversário','Chá de bebê'], 'active', now() - interval '12 days'),
  (su_film, s_luz, 'Quadro a Quadro Filmes', 'Filmagem com drone, teaser em 7 dias e filme completo do casamento em até 60 dias.',
   'Filmagem / Video Maker', NULL, ARRAY['Curitiba','São José dos Pinhais'], 'PR', 'Cabral', '41999990206', '@quadroaquadro', NULL,
   'A partir de R$ 5.600', ARRAY[img||'1537633552985-df8429e8048b'||q],
   ARRAY['Drone','Teaser em 7 dias'], ARRAY['Casamento','Corporativo'], 'active', now() - interval '8 days');

  -- 5. Events of the demo account
  INSERT INTO public.events (id, owner_id, name, type, event_date, guests_estimate, budget_total, notes, status, cost_per_guest, created_at) VALUES
  (ev_wed, u_demo, 'Casamento Ana & Pedro', 'Casamento', wedding, 150, 95000, 'Cerimônia às 16h30 na própria chácara.', 'planning', 185, now() - interval '55 days'),
  (ev_bday, u_demo, 'Aniversário de 60 anos da mãe', 'Aniversário', current_date + 45, 60, 14000, 'Jantar surpresa, combinar com a família.', 'planning', 120, now() - interval '20 days'),
  (ev_corp, u_demo, 'Confraternização de fim de ano', 'Corporativo', current_date + 70, 80, 22000, NULL, 'planning', NULL, now() - interval '10 days');

  -- 6. Contracts and payments (wedding)
  INSERT INTO public.event_contracts (event_id, owner_id, supplier_name, category, contact_name, contact_phone, contact_email, total_value,
    signed_date, service_date, cancellation_policy, penalty_clause, special_clauses, notes, status)
  VALUES (ev_wed, u_demo, 'Chácara Vale Verde', 'Espaço', 'Cláudia', '(41) 99999-0101', NULL, 27200, current_date - 50, wedding,
    'Cancelamento até 180 dias antes: devolução de 50% do sinal. Depois disso, sem devolução.', 'Multa de 30% do valor total em caso de rescisão pelo contratante.',
    'Horário limite às 2h; hora extra a R$ 850.', 'Inclui mesas, cadeiras e limpeza.', 'active') RETURNING id INTO c_id;
  INSERT INTO public.contract_payments (contract_id, owner_id, label, amount, due_date, paid, paid_date, payment_method) VALUES
  (c_id, u_demo, 'Sinal', 8160, current_date - 50, true, current_date - 50, 'Pix'),
  (c_id, u_demo, '2ª parcela', 6347, current_date - 5, false, NULL, NULL),
  (c_id, u_demo, '3ª parcela', 6347, current_date + 25, false, NULL, NULL),
  (c_id, u_demo, 'Quitação', 6346, wedding - 15, false, NULL, NULL);

  INSERT INTO public.event_contracts (event_id, owner_id, supplier_name, category, contact_name, contact_phone, total_value, signed_date, service_date,
    cancellation_policy, penalty_clause, notes, status)
  VALUES (ev_wed, u_demo, 'Sabor & Arte Buffet', 'Buffet', 'Rogério', '(41) 99999-0202', 31500, current_date - 35, wedding,
    'Número final de convidados até 15 dias antes; redução após essa data não gera desconto.', NULL, '150 convidados x R$ 210. Degustação marcada.', 'active') RETURNING id INTO c_id;
  INSERT INTO public.contract_payments (contract_id, owner_id, label, amount, due_date, paid, paid_date, payment_method) VALUES
  (c_id, u_demo, 'Entrada', 9450, current_date - 35, true, current_date - 35, 'Transferência'),
  (c_id, u_demo, '2ª parcela', 11025, current_date + 40, false, NULL, NULL),
  (c_id, u_demo, 'Saldo', 11025, wedding - 7, false, NULL, NULL);

  INSERT INTO public.event_contracts (event_id, owner_id, supplier_name, category, contact_name, contact_phone, total_value, signed_date, service_date, notes, status)
  VALUES (ev_wed, u_demo, 'Luz & Lente Fotografia', 'Fotografia', 'Juliana', '(41) 99999-0201', 6200, current_date - 28, wedding, 'Inclui pré-wedding no Jardim Botânico.', 'active') RETURNING id INTO c_id;
  INSERT INTO public.contract_payments (contract_id, owner_id, label, amount, due_date, paid, paid_date, payment_method) VALUES
  (c_id, u_demo, 'Sinal', 1860, current_date - 28, true, current_date - 28, 'Pix'),
  (c_id, u_demo, 'Saldo', 4340, wedding - 10, false, NULL, NULL);

  INSERT INTO public.event_contracts (event_id, owner_id, supplier_name, category, contact_name, total_value, signed_date, service_date, special_clauses, status)
  VALUES (ev_wed, u_demo, 'Flor de Lis Decorações', 'Decoração', 'Helena', 9800, current_date - 14, wedding, 'Flores podem ser substituídas por similares conforme a estação.', 'active') RETURNING id INTO c_id;
  INSERT INTO public.contract_payments (contract_id, owner_id, label, amount, due_date, paid, paid_date, payment_method) VALUES
  (c_id, u_demo, 'Sinal', 2940, current_date - 14, true, current_date - 14, 'Cartão'),
  (c_id, u_demo, 'Saldo', 6860, wedding - 20, false, NULL, NULL);

  INSERT INTO public.event_contracts (event_id, owner_id, supplier_name, category, contact_name, total_value, signed_date, service_date, status)
  VALUES (ev_wed, u_demo, 'DJ Marcos Beat', 'DJ/Música', 'Marcos', 3400, current_date - 7, wedding, 'active') RETURNING id INTO c_id;
  INSERT INTO public.contract_payments (contract_id, owner_id, label, amount, due_date, paid, payment_method) VALUES
  (c_id, u_demo, 'Parcela única', 3400, current_date + 12, false, NULL);

  -- birthday: one contract
  INSERT INTO public.event_contracts (event_id, owner_id, supplier_name, category, total_value, signed_date, service_date, status)
  VALUES (ev_bday, u_demo, 'Restaurante Dom Otto', 'Espaço', 7800, current_date - 6, current_date + 45, 'active') RETURNING id INTO c_id;
  INSERT INTO public.contract_payments (contract_id, owner_id, label, amount, due_date, paid, paid_date) VALUES
  (c_id, u_demo, 'Reserva', 1500, current_date - 6, true, current_date - 6),
  (c_id, u_demo, 'Saldo', 6300, current_date + 44, false, NULL);

  -- 7. Seating tables (wedding)
  FOR i IN 1..12 LOOP
    INSERT INTO public.event_tables (event_id, owner_id, label, capacity, sort_order)
    VALUES (ev_wed, u_demo,
      CASE i WHEN 1 THEN 'Mesa dos noivos' WHEN 2 THEN 'Família da noiva' WHEN 3 THEN 'Família do noivo' ELSE 'Mesa ' || i END,
      CASE WHEN i = 1 THEN 6 ELSE 10 END, i)
    RETURNING id INTO t;
    t_ids := t_ids || t;
  END LOOP;

  -- 8. Guests (wedding): 140 names, ~70% confirmed; part of the confirmed ones already seated
  FOR i IN 1..140 LOOP
    INSERT INTO public.event_guests (event_id, owner_id, name, status, category, billing, phone, guest_group, table_id, created_at)
    VALUES (ev_wed, u_demo,
      first_names[1 + (i * 7) % 40] || ' ' || last_names[1 + (i * 3) % 20] || CASE WHEN i % 13 = 0 THEN ' Jr.' ELSE '' END,
      CASE WHEN i % 10 IN (3, 7) THEN 'pending' WHEN i % 17 = 0 THEN 'declined' ELSE 'confirmed' END,
      CASE WHEN i % 23 = 0 THEN 'baby' WHEN i % 9 = 0 THEN 'child' ELSE 'adult' END,
      CASE WHEN i % 23 = 0 THEN 'exempt' WHEN i % 9 = 0 THEN 'half' ELSE 'full' END,
      CASE WHEN i % 4 = 0 THEN '(41) 9' || lpad((8000 + i * 37)::text, 4, '0') || '-' || lpad((i * 53 % 10000)::text, 4, '0') END,
      groups[1 + i % 6],
      CASE WHEN i % 10 NOT IN (3, 7) AND i % 17 <> 0 AND i <= 95 THEN t_ids[2 + (i % 11)] END,
      now() - (i || ' hours')::interval);
  END LOOP;
  -- the birthday: 34 guests
  FOR i IN 1..34 LOOP
    INSERT INTO public.event_guests (event_id, owner_id, name, status, category, billing, guest_group)
    VALUES (ev_bday, u_demo, first_names[1 + (i * 11) % 40] || ' ' || last_names[1 + (i * 7) % 20],
      CASE WHEN i % 5 = 0 THEN 'pending' ELSE 'confirmed' END, CASE WHEN i % 8 = 0 THEN 'child' ELSE 'adult' END,
      CASE WHEN i % 8 = 0 THEN 'half' ELSE 'full' END, CASE WHEN i % 2 = 0 THEN 'Família' ELSE 'Amigos' END);
  END LOOP;

  -- 9. Checklist (wedding template with countdown deadlines)
  INSERT INTO public.event_tasks (event_id, owner_id, title, category, assignee, due_offset_days, done, done_at, sort_order) VALUES
  (ev_wed, u_demo, 'Definir orçamento total', 'Planejamento', 'Ana e Pedro', 365, true, now() - interval '54 days', 1),
  (ev_wed, u_demo, 'Escolher e reservar o espaço', 'Espaço', 'Ana', 365, true, now() - interval '50 days', 2),
  (ev_wed, u_demo, 'Reservar a igreja / local da cerimônia', 'Cerimônia', 'Pedro', 365, true, now() - interval '48 days', 3),
  (ev_wed, u_demo, 'Contratar fotógrafo e filmagem', 'Foto e Vídeo', 'Ana', 180, true, now() - interval '28 days', 4),
  (ev_wed, u_demo, 'Contratar buffet / cardápio', 'Buffet', 'Ana e Pedro', 180, true, now() - interval '35 days', 5),
  (ev_wed, u_demo, 'Contratar decoração', 'Decoração', 'Ana', 180, true, now() - interval '14 days', 6),
  (ev_wed, u_demo, 'Contratar cerimonialista', 'Cerimônia', 'Pedro', 180, false, NULL, 7),
  (ev_wed, u_demo, 'Enviar Save the Date', 'Convidados', 'Ana', 180, true, now() - interval '20 days', 8),
  (ev_wed, u_demo, 'Definir lista de convidados', 'Convidados', 'Ana e Pedro', 90, true, now() - interval '10 days', 9),
  (ev_wed, u_demo, 'Escolher e provar doces e bolo', 'Buffet', 'Ana', 90, false, NULL, 10),
  (ev_wed, u_demo, 'Comprar / alugar traje dos noivos', 'Noivos', 'Pedro', 90, false, NULL, 11),
  (ev_wed, u_demo, 'Definir músicas da cerimônia', 'Cerimônia', 'Ana e Pedro', 90, false, NULL, 12),
  (ev_wed, u_demo, 'Enviar convites', 'Convidados', 'Ana', 90, false, NULL, 13),
  (ev_wed, u_demo, 'Documentação do cartório', 'Documentos', 'Pedro', 90, false, NULL, 14),
  (ev_wed, u_demo, 'Comprar alianças', 'Noivos', 'Ana e Pedro', 90, false, NULL, 15),
  (ev_wed, u_demo, 'Fechar confirmações de presença', 'Convidados', 'Ana', 30, false, NULL, 16),
  (ev_wed, u_demo, 'Definir mapa de mesas', 'Planejamento', 'Ana', 30, false, NULL, 17),
  (ev_wed, u_demo, 'Prova final do traje', 'Noivos', 'Ana', 30, false, NULL, 18),
  (ev_wed, u_demo, 'Teste de cabelo e maquiagem', 'Noivos', 'Ana', 30, false, NULL, 19),
  (ev_wed, u_demo, 'Confirmar horários com fornecedores', 'Planejamento', 'Pedro', 10, false, NULL, 20),
  (ev_wed, u_demo, 'Separar pagamentos finais', 'Financeiro', 'Pedro', 10, false, NULL, 21),
  (ev_wed, u_demo, 'Montar kit do dia (documentos, alianças)', 'Planejamento', 'Ana', 0, false, NULL, 22);
  INSERT INTO public.event_tasks (event_id, owner_id, title, category, assignee, due_date, done, sort_order) VALUES
  (ev_bday, u_demo, 'Combinar a surpresa com os irmãos', 'Planejamento', 'Ana', current_date + 3, false, 1),
  (ev_bday, u_demo, 'Escolher o cardápio do jantar', 'Buffet', 'Ana', current_date + 15, false, 2),
  (ev_bday, u_demo, 'Encomendar o bolo', 'Buffet', 'Ana', current_date + 30, false, 3);

  -- 10. Quote comparisons
  INSERT INTO public.event_comparisons (event_id, owner_id, title) VALUES (ev_wed, u_demo, 'Bolo e doces') RETURNING id INTO cmp;
  INSERT INTO public.comparison_options (comparison_id, owner_id, name, price, contact, notes, included, chosen, sort_order) VALUES
  (cmp, u_demo, 'Doce Encanto Confeitaria', 4300, '(41) 99999-0205', 'Degustação com 4 sabores.', '{"Bolo 3 andares": true, "Doces finos": true, "Bem-casados": true, "Entrega e montagem": true}', false, 1),
  (cmp, u_demo, 'Ateliê da Vovó', 3650, '(41) 99999-0311', 'Só bolo e bem-casados.', '{"Bolo 3 andares": true, "Doces finos": false, "Bem-casados": true, "Entrega e montagem": false}', false, 2),
  (cmp, u_demo, 'Maison Sucrée', 5900, '(41) 99999-0312', 'Bolo cenográfico + bolo de corte.', '{"Bolo 3 andares": true, "Doces finos": true, "Bem-casados": true, "Entrega e montagem": true}', false, 3);
  INSERT INTO public.event_comparisons (event_id, owner_id, title) VALUES (ev_wed, u_demo, 'Filmagem') RETURNING id INTO cmp;
  INSERT INTO public.comparison_options (comparison_id, owner_id, name, price, contact, notes, included, chosen, sort_order) VALUES
  (cmp, u_demo, 'Quadro a Quadro Filmes', 5600, '(41) 99999-0206', 'Teaser em 7 dias.', '{"Drone": true, "Teaser": true, "Filme completo": true, "Making of": false}', true, 1),
  (cmp, u_demo, 'Studio Lumière', 7200, '(41) 99999-0313', NULL, '{"Drone": true, "Teaser": true, "Filme completo": true, "Making of": true}', false, 2),
  (cmp, u_demo, 'Rec Wedding', 4100, '(41) 99999-0314', 'Sem drone.', '{"Drone": false, "Teaser": true, "Filme completo": true, "Making of": false}', false, 3);
  INSERT INTO public.event_comparisons (event_id, owner_id, title) VALUES (ev_corp, u_demo, 'Espaços') RETURNING id INTO cmp;
  INSERT INTO public.comparison_options (comparison_id, owner_id, name, price, capacity, included, sort_order) VALUES
  (cmp, u_demo, 'Espaço Prisma Corporate', 3900, 180, '{"Estacionamento": true, "Som": true, "Buffet": false}', 1),
  (cmp, u_demo, 'Restaurante Dom Otto', 6100, 90, '{"Estacionamento": true, "Som": false, "Buffet": true}', 2);

  -- 11. Calendar reminders
  INSERT INTO public.agenda_reminders (owner_id, event_id, date, title, notes) VALUES
  (u_demo, ev_wed, current_date + 2, 'Degustação do buffet', 'Levar a lista de restrições alimentares.'),
  (u_demo, ev_wed, current_date + 9, 'Reunião com a decoradora', 'Aprovar o projeto 3D.'),
  (u_demo, ev_wed, current_date + 21, 'Prova do vestido', NULL),
  (u_demo, ev_bday, current_date + 4, 'Ligar para o Dom Otto', 'Confirmar o menu fechado.'),
  (u_demo, NULL, current_date + 1, 'Pagar fatura do cartão', NULL);

  -- 12. Quotes requested by the demo account (shown in "Meus orçamentos")
  INSERT INTO public.quotes (space_id, guest_id, host_id, event_type, event_date, guests_count, duration_hours, message, host_response, proposed_price, status, created_at, responded_at, event_time)
  VALUES
  (sp_vale, u_demo, h_vale, 'Casamento', wedding, 150, 10, 'Olá! Queremos fazer cerimônia e festa no mesmo lugar. A capela comporta 150 pessoas?',
   'Oi, Ana! Comporta sim, com 160 cadeiras. Segue a proposta com a diária completa e montagem no dia anterior.', 27200, 'accepted', now() - interval '52 days', now() - interval '51 days', '16:30'),
  (sp_casa, u_demo, h_otto, 'Casamento', wedding, 150, 8, 'Vocês recebem 150 convidados com pista de dança?', NULL, NULL, 'pending', now() - interval '3 days', NULL, '17:00'),
  (sp_otto, u_demo, h_otto, 'Aniversário', current_date + 45, 60, 4, 'Jantar de aniversário de 60 anos, de preferência no salão reservado.',
   'Temos o salão reservado nessa data. O menu fechado sai por R$ 130 por pessoa.', 7800, 'responded', now() - interval '9 days', now() - interval '8 days', '20:00');
  INSERT INTO public.reviews (quote_id, reviewer_id, space_id, text)
  SELECT id, u_demo, sp_vale, 'Atendimento rápido e a proposta veio completa. A visita ao espaço superou as fotos.'
  FROM public.quotes WHERE space_id = sp_vale AND guest_id = u_demo;
END;
$$;

REVOKE ALL ON FUNCTION demo.reset() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION demo.upsert_user(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
