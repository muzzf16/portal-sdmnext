-- Fix avatarUrl paths in pegawai, pengguna, and users tables by replacing '/uploads/avatars/' with '/avatars/'
UPDATE pegawai 
SET avatarUrl = replace(avatarUrl, '/uploads/avatars/', '/avatars/') 
WHERE avatarUrl LIKE '/uploads/avatars/%';

UPDATE pengguna 
SET avatarUrl = replace(avatarUrl, '/uploads/avatars/', '/avatars/') 
WHERE avatarUrl LIKE '/uploads/avatars/%';

UPDATE users 
SET avatarUrl = replace(avatarUrl, '/uploads/avatars/', '/avatars/') 
WHERE avatarUrl LIKE '/uploads/avatars/%';
