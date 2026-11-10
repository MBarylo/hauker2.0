// Запит 1 (проста вибірка): користувач для входу
export const Q1_FIND_USER_FOR_LOGIN = `
SELECT id, username, email, password, "roleId"
FROM "user"
WHERE username = $1 OR email = $1`;

// Запит 2 (проста вибірка): дані профілю
export const Q2_PROFILE = `
SELECT id, username, bio, "avatarUrl", "bannerUrl", "createdAt"
FROM "user"
WHERE id = $1`;

// Запит 3 (складна вибірка): загальна стрічка + пошук
export const Q3_FEED = `
SELECT p.*, u.username AS author,
       count(DISTINCT l.id)::int AS likes,
       count(DISTINCT c.id)::int AS comments
FROM post p
JOIN "user" u ON u.id = p."authorId"
LEFT JOIN "like" l ON l."postId" = p.id
LEFT JOIN comment c ON c."postId" = p.id
WHERE $1::text IS NULL OR p.content ILIKE '%' || $1 || '%'
GROUP BY p.id, u.id
ORDER BY p.id DESC`;

// Запит 4 (складна вибірка): збережені пости
export const Q4_SAVED = `
SELECT p.*, u.username AS author,
       count(l.id)::int AS likes,
       b."createdAt" AS saved_at
FROM bookmark b
JOIN post p ON p.id = b."postId"
JOIN "user" u ON u.id = p."authorId"
LEFT JOIN "like" l ON l."postId" = p.id
WHERE b."userId" = $1
GROUP BY p.id, u.username, b."createdAt"
ORDER BY b."createdAt" DESC`;

// Запит 5 (складна вибірка): коментарі користувача
export const Q5_MY_COMMENTS = `
SELECT c.id, c.content AS comment, p.content AS post,
       a.username AS post_author,
       count(l.id)::int AS post_likes
FROM comment c
JOIN post p ON p.id = c."postId"
JOIN "user" a ON a.id = p."authorId"
LEFT JOIN "like" l ON l."postId" = p.id
WHERE c."authorId" = $1
GROUP BY c.id, c.content, p.id, p.content, a.username
ORDER BY c."createdAt" DESC`;

// Запит 6 (вкладена вибірка, IN): стрічка підписок
export const Q6_FOLLOWING_FEED = `
SELECT p.*
FROM post p
WHERE p."authorId" IN (
  SELECT "followingId"
  FROM follow
  WHERE "followerId" = $1
)
ORDER BY p.id DESC`;

// Запит 7 (вкладена вибірка, EXISTS): вподобані пости
export const Q7_LIKED = `
SELECT p.*
FROM post p
WHERE EXISTS (
  SELECT 1
  FROM "like" l
  WHERE l."postId" = p.id
    AND l."userId" = $1
)
ORDER BY p.id DESC`;

// Запит 8 (створення таблиці, SELECT ... INTO)
export const Q8_DROP_STATS = `DROP TABLE IF EXISTS user_stats`;
export const Q8_CREATE_STATS = `
SELECT u.id AS "userId", u.username,
  (SELECT count(*) FROM post p
   WHERE p."authorId" = u.id)::int AS posts_count,
  (SELECT count(*) FROM comment c
   WHERE c."authorId" = u.id)::int AS comments_count,
  (SELECT count(*) FROM follow f
   WHERE f."followingId" = u.id)::int AS followers_count
INTO user_stats
FROM "user" u`;

// Запит 9 (UPDATE): оновлення профілю
export const Q9_UPDATE_PROFILE = `
UPDATE "user"
SET bio = $2,
    "avatarUrl" = COALESCE($3, "avatarUrl"),
    "bannerUrl" = COALESCE($4, "bannerUrl")
WHERE id = $1
RETURNING id, username, bio, "avatarUrl", "bannerUrl"`;

// Запит 10 (DELETE): видалення коментаря
export const Q10_DELETE_COMMENT = `
DELETE FROM comment
WHERE id = $1
  AND "authorId" = $2`;
