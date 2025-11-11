<template>
    <div id="login">
        <v-card>
            <h1>Login</h1>
            <v-form>
                <v-container>
                    <v-row>
                        <v-col col="12" md="4">
                            <v-text-field label="Username" type="text" name="username" v-model="username" outlined>
                            </v-text-field>
                        </v-col>
                        <v-col col="12" md="4">
                            <v-text-field label="password" type="password" name="password" v-model="password" outlined>
                            </v-text-field>
                        </v-col>
                        <v-col col="12" md="4">
                            <v-btn @click="login">Login</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </v-card>

    </div>
</template>
<script>
import axios from 'axios'

export default {
    name: 'LoginView',
    data() {
        return {

            username: "",
            password: "",
            auth: "",

        }
    },
    methods: {
        async login() {
            if (this.username != "" && this.password != "") {

                await axios.get("http://172.21.1.51:8080/empAdmin/login", { params: { userName: this.username, Password: this.password } }).then((response) => {
                    this.auth = response.data;
                    console.log(this.auth.message)
                }).catch((error) => {
                console.log(error.resp);
              });
                if (this.auth.message == "true") {
                    sessionStorage.setItem('LoggedUser', "true");
                    sessionStorage.setItem('userName', this.username)
                    this.$emit("authenticated", true);
                    this.$router.replace({ path: "/listRepair" });
                } else {
                    alert("The username and / or password is incorrect");
                    console.log("The username and / or password is incorrect");
                }
            } else {
                console.log("A username and password must be present");
            }
        }
    }
}
</script>

<style scoped>
#login {
    width: 500px;
    border: 1px solid #CCCCCC;
    background-color: #FFFFFF;
    margin: auto;
    margin-top: 200px;
    padding: 20px;
}
</style>