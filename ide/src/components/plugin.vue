<template>
  <iframe ref="frame" seamless="true" style="border: none" src="./plugin.html"></iframe>
</template>

<script lang="ts" setup>
import { ref, onMounted, } from 'vue';

const frame = ref<HTMLElement>(null as any);

const emit = defineEmits(["load"]);

onMounted(() => {
  frame.value.addEventListener('load', (e: any) => {
    emit('load', e);
  });
});

</script>

<style>
</style>
