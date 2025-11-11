<template>
  <p>Home</p>
</template>

<script>


  export default {
    name: 'Home',
    
    components: {

    },
    mounted() {
    this.$router.push('/about');
  }
  }
</script>
