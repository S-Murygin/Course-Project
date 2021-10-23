INSERT INTO users VALUES
    ('admin', '$2y$10$IMdULLHVn9Wji9EFz65qsumV1BLPCWteIzUN/Si/JRTZUl.gZfEyu', true),
    ('user', '$2y$10$1y4iWb7BJH9fO1TXeqfV8u0E3baycKXEB6cpL.0DFfvukyBKbOura', true);

INSERT INTO authorities VALUES
    ('admin', 'ROLE_ADMIN'),
    ('user', 'ROLE_USER');
