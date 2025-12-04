<template>
    <div class="bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-3">Reflection</h3>
        <div class="space-y-4">
            <div>
                <label class="text-sm text-gray-600">What went well this week?</label>
                <textarea v-model="good" @input="save" class="w-full mt-1 p-2 border rounded h-28"></textarea>
            </div>
            <div>
                <label class="text-sm text-gray-600">Where can I improve?</label>
                <textarea v-model="improve" @input="save" class="w-full mt-1 p-2 border rounded h-28"></textarea>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
const KEY_GOOD = 'reflection_good';
const KEY_IMPROVE = 'reflection_improve';
export default {
    setup() {
        const good = ref(localStorage.getItem(KEY_GOOD) || '');
        const improve = ref(localStorage.getItem(KEY_IMPROVE) || '');
        function save() {
            localStorage.setItem(KEY_GOOD, good.value);
            localStorage.setItem(KEY_IMPROVE, improve.value);
        }
        return { good, improve, save };
    },
};
</script>
