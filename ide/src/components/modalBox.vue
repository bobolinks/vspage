<template>
  <div class="modal">
    <div class="body">
      <div class="content">
        <label>{{ content }}</label>
      </div>
      <div class="bottom"
        style="align-items: center; display: flex; flex-direction: row; justify-content: space-around">
        <button v-if="showCancel" @click="onCancel" style="border-right: 1px solid #f2f2f2">{{ cancelText }}</button>
        <button @click="onConfirm">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

defineProps({
  content: {
    type: String,
    default: 'asd',
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  confirmText: {
    type: String,
    default: '确定',
  },
});

const emit = defineEmits(["action"]);

const onCancel = () => {
  emit('action', 'action');
};

const onConfirm = () => {
  emit('action', 'confirm');
};

</script>
<style scoped>
.body {
  font-size: 12px;
  background: #fefefe;
  border: 1px solid #f2f2f2;
  border-radius: 8px;
  min-width: 60%;
  box-shadow: 1px 1px 4px 1px #ccc;
}

.content {
  padding: 20px;
  text-align: center;
}

.bottom {
  border-top: 1px solid #f2f2f2;
  justify-content: stretch;
}

.bottom button {
  flex: 1 1 auto;
  border: none;
  padding: 10px 20px;
  background: none;
  cursor: pointer;
}
</style>
