drop TABLE if exists simpson;

create table if not exists simpson(
    id SERIAL PRIMARY KEY NOT NULL,
    quote TEXT,
    character varchar(255),
    image VARCHAR(255),
    characterDirection VARCHAR(50)
);

