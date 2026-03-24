create extension if not exists "pg_net" with schema "extensions";


  create table "public"."speaking_history" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "topic" text not null,
    "duration_seconds" integer not null default 60
      );


CREATE UNIQUE INDEX speaking_history_pkey ON public.speaking_history USING btree (id);

alter table "public"."speaking_history" add constraint "speaking_history_pkey" PRIMARY KEY using index "speaking_history_pkey";

grant delete on table "public"."speaking_history" to "anon";

grant insert on table "public"."speaking_history" to "anon";

grant references on table "public"."speaking_history" to "anon";

grant select on table "public"."speaking_history" to "anon";

grant trigger on table "public"."speaking_history" to "anon";

grant truncate on table "public"."speaking_history" to "anon";

grant update on table "public"."speaking_history" to "anon";

grant delete on table "public"."speaking_history" to "authenticated";

grant insert on table "public"."speaking_history" to "authenticated";

grant references on table "public"."speaking_history" to "authenticated";

grant select on table "public"."speaking_history" to "authenticated";

grant trigger on table "public"."speaking_history" to "authenticated";

grant truncate on table "public"."speaking_history" to "authenticated";

grant update on table "public"."speaking_history" to "authenticated";

grant delete on table "public"."speaking_history" to "service_role";

grant insert on table "public"."speaking_history" to "service_role";

grant references on table "public"."speaking_history" to "service_role";

grant select on table "public"."speaking_history" to "service_role";

grant trigger on table "public"."speaking_history" to "service_role";

grant truncate on table "public"."speaking_history" to "service_role";

grant update on table "public"."speaking_history" to "service_role";


