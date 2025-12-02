module.exports = {
  devServer: {
    // host: 'localhost',
    // port: 8000,
    host: process.env.VUE_APP_DEV_HOST || "localhost",
    port: process.env.VUE_APP_DEV_PORT || 8000,

    proxy: {
      "/api": {
        // target: "http://172.21.1.51:8080",
        // target: "http://172.21.200.211:8080",
        target: process.env.VUE_APP_API_TARGET, // 💥 dynamic API host
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      "/idm": {
        target: "https://idm.pea.co.th/webservices",
        ws: true,
        changeOrigin: true,
      },
    },
  },
  transpileDependencies: ["vuetify"],
};
