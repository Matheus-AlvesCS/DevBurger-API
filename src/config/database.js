module.exports = {
  dialect: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "devpost",
  database: "devburger",
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
