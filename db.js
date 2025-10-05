const admin = require("firebase-admin");

const serviceAccount = {
  type: "service_account",
  project_id: "kadore-e-pagers",
  private_key_id: "7b6a7da7cfebf4dc3237c92a1b3eacd4600b803b",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC/r4Ad5cew9ftG\nX3Hc/twQiOkbKhQC7aO+9dA/eViG1t/lw8JlsbEuQa8+hvL7Fw683FuEcvM32c/s\nVCh8zhk0y2SlfEnwIzlqKqu6WBsislQTFPOOSGpkibusUbYiI6y7KWG/nfr1lQ7g\nITQpdxtxBAEh86TFI1mqONojEVH9632HR+aLmg6ufmWwPHwROe+v4DfHN2MFpFpD\nflqMufCjI6UE4OjvyMZbhI7smgsS2+ViHQfI4Q3QAiOjVF58Zh1S2XxYpHK9LrTW\nr7orztEQRHFQW24ogZLXqi5BFYxXKUE2bDYdzWl0XiKA2P0PBceYXZOEwMMMe3D5\n9sgWQ2B7AgMBAAECggEAQKUZWfviSqXKZkNODS/OW60woD6inRIzxPT1lFKCLodM\n3xoT92Pj0yvHxBiS3Wc7Syotmw+BQvasDpGbTevbyFhHyx+Nd/UJKerWG3QXQq5N\neFn6gaOebeWda1HrULwjRsN/+bV3q1bnu2K3SrymfojRMPgQO4Pee2/M8UKoGi+5\nrR1krl+UQyAu+a1XAJ1hhqATYf8nVLlcLll6wW4jo+Pz43CJniDwQo3goqCGGoPy\nn/ov++Kv7noW2KfU0cnTFFDsqzfzGYkP9jQ1HgYrpqKi9/9MEUVTm+zNLFRi31QB\nAOVl6dSVpXdb++W3AfjeC6WKBvvrELbzgsLhuJuvEQKBgQDeeF7rNIs7+08IZQDZ\nnRxyhrNfGr18b0n95Igwb4DkgtcBaqhYzF8sKdTvvSgf93ZtsEdjDz0+NXYpJ7ey\n+ZiCaKJcdKGfce8v2SKVttHeGiZdm7HcTAvN+vItv2kJCdqS21u7755X33PNQTOe\nNfndTYM9g7BF5MKeFq+4HZ/YVQKBgQDck1tlz4O7J+MCpkrMzOFZoAqD6TWd/RVL\nZOVVbDq53aJgYjm1hPp5SDN8/MrLlxNPY0twiGfiZoRpRiN5ngPTOmnkPQFK8uTJ\nZ/iLcoSELOxeaBMiJsIcmRI9yfRtZBGXHEgcaoYVbTLG/7yAjpg6NPF7XR/BF3ue\nTkv9syBljwKBgQDJlHo1VyP+UqV3LsYJaLHZGDK5ryoY8WIzGvtIIBDDfcbB8tnd\ntDlcc/8Mx/HunTUDCOJ2YN2WW6zYd7OdCUpmh9buPYQhTIR1b6NF0yTwwfMXiLct\nrP5ZQtRkHXdYCES0Iu1JKkLozoFIb5cM+U2Rd+W+PG/htPmfc2D/TGCFDQKBgQCx\nSi+4UWcMUy7/vjF5E2Q96YkKJbRW3Ej1ZI+AbZF2O1J8Lfc8kznPqdzYpUdLBI8c\nzC6isMDvFH9xLlLtObjRWq4qKW6Uk06ZI9x+GPmyU3lZGEXouUZkPhSPXXf9ROVu\nk+jSDjzfk/mwQXV9zx9ECbHe+ia/yOQvhbdGn2d2uQKBgQClLn9StWzc5Yx35/Q+\nki4QqiMUvDqrp/hL1P4AU+NSdkWElhdqa2kZnmtwesl004Gt29AfF+YO9E0f5mg4\nvL+JuI1SvjArnMk5as8jiFbdvbPSpftL1gWfMQO6M3kUbU7qobNPG3BecOxxIa6y\nOe8rJE7rtaRWVrNqo/oRkpcjSw==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-25vrz@kadore-e-pagers.iam.gserviceaccount.com",
  client_id: "101254553405768558104",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.CLIENT_EMAIL}`,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
