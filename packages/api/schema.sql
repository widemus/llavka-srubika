CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    balance INT DEFAULT 0,
    last_daily_claim DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cost INT NOT NULL,
    type ENUM('avatar', 'color', 'rank') NOT NULL,
    image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    equipped BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (item_id) REFERENCES items (id)
);

INSERT INTO
    items (name, cost, type, image_url)
VALUES (
        'Blue Avatar',
        500,
        'avatar',
        'avatar_blue.png'
    ),
    (
        'Red Avatar',
        500,
        'avatar',
        'avatar_red.png'
    ),
    (
        'Gold Rank',
        10000,
        'rank',
        'rank_gold.png'
    )
ON DUPLICATE KEY UPDATE
    name = name;