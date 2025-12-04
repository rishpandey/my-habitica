<template>
    <div class="bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-3">Past</h3>
        <div class="text-sm text-gray-600 mb-3">Completed tasks by life area (from known history)</div>
        <div v-if="log.length">
            <div class="text-sm text-gray-600 mb-2">Recent completions</div>
            <div class="space-y-2">
                <div v-for="entry in log" :key="entry.date + entry.text" class="flex justify-between py-2 border-b">
                    <div class="text-sm">
                        {{ entry.text }}
                        <span class="text-xs text-gray-500">• {{ entry.life }}</span>
                    </div>
                    <div class="text-xs text-gray-500">{{ new Date(entry.date).toLocaleString() }}</div>
                </div>
            </div>
        </div>
        <div v-else-if="Object.keys(history).length">
            <div v-for="(count, area) in history" :key="area" class="flex justify-between py-2 border-b">
                <div>{{ area }}</div>
                <div class="font-medium">{{ count }}</div>
            </div>
        </div>
        <div v-else class="text-sm text-gray-500">No completion history available. Showing counts from current tasks.</div>
    </div>
</template>

<script>
import { computed } from 'vue';
export default {
    props: ['store'],
    setup(props) {
        const store = props.store;
        const history = computed(() => store.completedHistory());
        const log = computed(() => store.completedLog());
        return { history, log };
    },
};
</script>
