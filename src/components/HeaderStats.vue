<template>
    <div class="bg-white shadow rounded p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div class="flex-shrink-0">
            <div class="text-sm text-gray-500">Level</div>
            <div class="font-semibold text-lg">{{ stats.level ?? '-' }}</div>
            <div class="w-full sm:w-48 bg-gray-200 h-2 rounded mt-2">
                <div class="h-2 rounded bg-indigo-500" :style="{ width: xpPct + '%' }"></div>
            </div>
        </div>
        <div class="flex-1">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                <div class="text-center">
                    <div class="text-xs text-gray-500">HP</div>
                    <div class="font-medium">{{ stats.hp ?? '-' }}</div>
                </div>
                <div class="text-center">
                    <div class="text-xs text-gray-500">Gold</div>
                    <div class="font-medium">{{ stats.gold ?? '-' }}</div>
                </div>
                <div class="text-center">
                    <div class="text-xs text-gray-500">Achievements</div>
                    <div class="font-medium">{{ user?.achievementsCount ?? '-' }}</div>
                </div>
                <div class="text-center">
                    <div class="text-xs text-gray-500">Due</div>
                    <div class="font-medium">{{ dueCount }}</div>
                </div>
            </div>
        </div>
        <div class="text-sm text-gray-500 hidden sm:block">Updated</div>
    </div>
</template>

<script>
import { computed } from 'vue';
export default {
    props: ['user', 'headerStats', 'dueCount'],
    setup(props) {
        const stats = computed(() => props.headerStats || {});
        const xpPct = computed(() => {
            if (!props.headerStats) return 0;
            const xp = props.headerStats.xp || 0;
            const max = props.headerStats.maxXp || 100;
            return Math.min(100, Math.round((xp / max) * 100));
        });
        return { stats, xpPct };
    },
};
</script>
