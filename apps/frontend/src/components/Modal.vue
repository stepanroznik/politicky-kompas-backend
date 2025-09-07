<template>
    <teleport to="body">
        <transition name="modal">
            <div
                v-if="show"
                class="fixed z-50 inset-0 overflow-y-auto"
                @close="$emit('close')"
            >
                <div class="flex bg-black bg-opacity-40 items-end justify-center h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <span
                        class="hidden sm:inline-block sm:align-middle sm:h-screen"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>
                    <div
                        class="inline-block
                        align-bottom
                        bg-white
                        rounded-lg
                        px-4
                        pt-5
                        pb-4
                        text-left
                        overflow-hidden
                        shadow-xl
                        transform
                        transition-all
                        sm:my-8
                        sm:align-middle
                        sm:max-w-lg
                        sm:w-full
                        sm:p-6"
                    >   
                        <h3 class="text-lg text-center font-semibold">
                            {{ message }}
                        </h3>
                        <p
                            v-if="text"
                            class="py-5"
                        >
                            {{ text }}
                        </p>
                        <div class="flex gap-2 justify-center">
                            <button-default
                                v-if="buttonNo"
                                @click="$emit('close', false)"
                            >
                                {{ buttonNo }}
                            </button-default>
                            <button-default @click="$emit('close', true)">
                                {{ buttonYes }}
                            </button-default>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
import ButtonDefault from "./ButtonDefault.vue";

defineProps({ 
    show: {
        type: Boolean,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        default: '',
    },
    buttonYes: {
        type: String,
        default: 'Ok'
    },
    buttonNo: {
        type: String,
        default: ''
    }});

defineEmits(['close']);
</script>

<style>
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
}

.modal-wrapper {
    display: table-cell;
    vertical-align: middle;
}

.modal-container {
    width: 300px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
    margin-top: 0;
    color: #42b983;
}

.modal-body {
    margin: 20px 0;
}

.modal-default-button {
    display: block;
    margin-top: 1rem;
}

.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.5s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>