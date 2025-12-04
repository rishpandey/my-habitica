<template>
    <div :class="['bg-white rounded shadow p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3', completed ? 'bg-gray-50' : '']">
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
                <span class="text-lg sm:text-base flex-shrink-0">{{ recEmoji }}</span>

                <div :class="['font-semibold text-sm sm:text-base break-words', completed ? 'line-through text-gray-400' : '']">{{ task.text }}</div>

                <template v-for="tag in tagList" :key="tag">
                    <div class="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600 whitespace-nowrap">{{ tag }}</div>
                </template>
                <div v-if="completed" class="text-xs px-2 py-0.5 rounded text-green-700 bg-green-100 border border-green-200 whitespace-nowrap">Completed</div>
            </div>

            <div v-if="task.notes" class="text-xs sm:text-sm text-gray-600 mt-2 italic">
                <div
                    @click="notesExpanded = !notesExpanded"
                    class="cursor-pointer hover:text-gray-800 active:text-gray-900"
                    :title="notesExpanded ? 'Click to collapse' : 'Click to expand'"
                >
                    <span v-if="!notesExpanded" class="break-words">{{ truncatedFirstLine }}</span>
                    <span v-else class="whitespace-pre-wrap break-words">{{ task.notes }}</span>
                    <span v-if="shouldShowToggle" class="ml-1 text-gray-400">{{ notesExpanded ? '▼' : '▶' }}</span>
                </div>
            </div>
        </div>
        <div class="flex gap-2 items-center justify-between sm:justify-end flex-shrink-0 mt-2 sm:mt-0">
            <div class="text-xs sm:text-sm px-2 py-1 rounded bg-gray-100 whitespace-nowrap">{{ dueInfo }}</div>

            <div class="flex gap-2 items-center">
                <button
                    v-if="showNotes"
                    @click="$emit('toggleNotes', task.id)"
                    class="text-gray-400 hover:text-gray-600 w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center active:bg-gray-100 transition-colors"
                    title="View/Edit notes"
                >
                    ✏️
                </button>
                <div v-if="!completed && showMark">
                    <button
                        @click="onMark"
                        :disabled="disabled"
                        class="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors text-lg sm:text-base"
                        title="Mark as done"
                    >
                        ✓
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import dayjs from 'dayjs';
import { ref, computed } from 'vue';
export default {
    props: ['task', 'onMark', 'showMark', 'getLifeArea', 'getRecurrence', 'parseNextDue', 'getTagNames', 'disabled', 'showNotes'],
    emits: ['toggleNotes'],
    setup(props) {
        const notesExpanded = ref(false);

        const firstLine = computed(() => {
            if (!props.task.notes) return '';
            const lines = props.task.notes.split('\n');
            return lines[0];
        });

        const truncatedFirstLine = computed(() => {
            const line = firstLine.value;
            if (line.length <= 50) return line;
            return line.substring(0, 50) + '...';
        });

        const shouldShowToggle = computed(() => {
            if (!props.task.notes) return false;
            return props.task.notes.includes('\n') || props.task.notes.length > 50;
        });
        const freqLabel = props.getRecurrence(props.task);
        // normalize recurrence into known buckets and provide an emoji + tooltip
        function normalizeRec(r) {
            if (!r) return 'other';
            const rr = String(r).toLowerCase();
            if (rr.includes('daily')) return 'daily';
            if (rr.includes('weekly')) return 'weekly';
            if (rr.includes('monthly')) return 'monthly';
            if (rr.includes('quarter')) return 'quarterly';
            if (rr.includes('year')) return 'yearly';
            return 'other';
        }
        let rec = normalizeRec(freqLabel);
        // fallback: inspect some common task fields if recurrence is unknown
        if (rec === 'other') {
            const f = props.task && (props.task.frequency || props.task.type || '');
            rec = normalizeRec(f);
        }
        const recMap = {
            daily: { emoji: '☀️', label: 'Daily' },
            weekly: { emoji: '📅', label: 'Weekly' },
            monthly: { emoji: '🗓️', label: 'Monthly' },
            quarterly: { emoji: '¼', label: 'Quarterly' },
            yearly: { emoji: '🎊', label: 'Yearly' },
            other: { emoji: '⭐', label: 'One-off' },
        };
        const recEmoji = recMap[rec] ? recMap[rec].emoji : recMap.other.emoji;
        const recLabelFull = recMap[rec] ? recMap[rec].label : 'Other';
        // display only emoji in the compact chip; tooltip shows full label
        const recLabelDisplay = '';
        const nd = props.parseNextDue(props.task);
        const dueInfo = nd ? (nd.isSame(dayjs(), 'day') ? 'Due today' : nd.format('MMM D')) : 'No due';
        const completed = !!props.task.completed;

        // Resolve tag names (map ids -> names via getTagNames if provided)
        const rawTags = props.getTagNames ? props.getTagNames(props.task) || [] : props.task.tags || [];
        // normalize to strings and remove falsy
        const tagNames = Array.isArray(rawTags) ? rawTags.map(t => (t && typeof t === 'string' ? t : t && t.name ? t.name : '')).filter(Boolean) : [];
        // unique tag list
        const tagList = Array.from(new Set(tagNames));

        function mark() {
            if (props.onMark && !props.disabled) props.onMark(props.task.id);
        }
        return {
            freqLabel,
            dueInfo,
            onMark: mark,
            completed,
            tagList,
            recEmoji,
            recLabelFull,
            recLabelDisplay,
            notesExpanded,
            truncatedFirstLine,
            shouldShowToggle,
        };
    },
};
</script>
