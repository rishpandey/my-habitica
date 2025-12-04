<template>
    <div :class="['bg-white rounded shadow p-3 flex justify-between items-center gap-3', completed ? 'bg-gray-50' : '']">
        <div class="flex-1">
            <div class="flex items-center gap-2">
                <span class="mr-1">{{ recEmoji }}</span>

                <div :class="['font-semibold', completed ? 'line-through text-gray-400' : '']">{{ task.text }}</div>

                <template v-for="tag in tagList" :key="tag">
                    <div class="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">{{ tag }}</div>
                </template>
                <div v-if="completed" class="text-xs px-2 py-0.5 rounded text-green-700 bg-green-100 border border-green-200">Completed</div>
            </div>

            <div v-if="task.notes" class="text-sm text-gray-600 mt-1 italic">
                <div
                    @click="notesExpanded = !notesExpanded"
                    class="cursor-pointer hover:text-gray-800"
                    :title="notesExpanded ? 'Click to collapse' : 'Click to expand'"
                >
                    <span v-if="!notesExpanded">{{ truncatedFirstLine }}</span>
                    <span v-else class="whitespace-pre-wrap">{{ task.notes }}</span>
                    <span v-if="shouldShowToggle" class="ml-1 text-gray-400">{{ notesExpanded ? '▼' : '▶' }}</span>
                </div>
            </div>
        </div>
        <div class="flex gap-2 items-center flex-shrink-0">
            <div class="text-xs px-2 py-0.5 rounded">{{ dueInfo }}</div>

            <button
                v-if="showNotes"
                @click="$emit('toggleNotes', task.id)"
                class="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center"
                title="View/Edit notes"
            >
                ✏️
            </button>
            <div v-if="!completed && showMark">
                <button
                    @click="onMark"
                    :disabled="disabled"
                    class="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-50"
                    title="Mark as done"
                >
                    ✓
                </button>
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
