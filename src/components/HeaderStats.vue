<template>
    <div class="bg-white shadow rounded p-4 flex items-center gap-4">
        <div>
            <div class="text-sm text-gray-500">Level</div>
            <div class="font-semibold text-lg">{{ stats.level ?? '-' }}</div>
            <div class="w-48 bg-gray-200 h-2 rounded mt-2">
                <div class="h-2 rounded bg-indigo-500" :style="{ width: xpPct + '%' }"></div>
            </div>
        </div>
        <div class="flex-1">
            <div class="grid grid-cols-4 gap-4 text-sm">
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
        <div class="text-sm text-gray-500">Updated</div>
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
