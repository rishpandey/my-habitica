<template>
    <div class="space-y-4">
        <div v-if="viewMode === 'table'" class="space-y-4">
            <!-- Today Table -->
            <div>
                <h3
                    class="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2 cursor-pointer py-2 -mx-2 px-2 active:bg-gray-100 rounded transition-colors"
                    @click="showToday = !showToday"
                >
                    <span class="text-lg">{{ showToday ? '▼' : '▶' }}</span>
                    <span>Today</span>
                </h3>
                <div v-if="showToday" class="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Title</th>
                                <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Due</th>
                                <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden sm:table-cell">Recurrence</th>
                                <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden md:table-cell">Life Area</th>
                                <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden lg:table-cell">Completed</th>
                                <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-100">
                            <tr v-for="t in today" :key="t.id">
                                <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm break-words max-w-xs">{{ t.text }}</td>
                                <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                                    {{ parseNextDue(t) ? parseNextDue(t).format('YYYY-MM-DD') : '-' }}
                                </td>
                                <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">{{ getRecurrence(t) }}</td>
                                <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{{ getLifeArea(t.tags) }}</td>
                                <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">{{ t.completed ? 'Yes' : 'No' }}</td>
                                <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                                    <button
                                        v-if="!t.completed"
                                        @click="markDone(t.id)"
                                        class="text-xs sm:text-sm text-indigo-600 px-2 py-1 active:bg-indigo-50 rounded"
                                    >
                                        Mark
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="!today.length">
                                <td class="px-3 py-1 text-sm text-gray-500" colspan="6">No tasks due today.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Upcoming Tables -->
            <div>
                <div class="space-y-3">
                    <div>
                        <div
                            class="text-sm sm:text-base text-gray-600 mb-2 flex items-center gap-2 cursor-pointer py-2 -mx-2 px-2 active:bg-gray-100 rounded transition-colors"
                            @click="show7Days = !show7Days"
                        >
                            <span class="text-base">{{ show7Days ? '▼' : '▶' }}</span>
                            <span>Next 7 days</span>
                        </div>
                        <div v-if="show7Days" class="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Title</th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Due</th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden sm:table-cell">
                                            Recurrence
                                        </th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden md:table-cell">
                                            Life Area
                                        </th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden lg:table-cell">
                                            Completed
                                        </th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-100">
                                    <tr v-for="t in upcoming7" :key="t.id">
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm break-words max-w-xs">{{ t.text }}</td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                                            {{ parseNextDue(t) ? parseNextDue(t).format('YYYY-MM-DD') : '-' }}
                                        </td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">{{ getRecurrence(t) }}</td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{{ getLifeArea(t.tags) }}</td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                                            {{ t.completed ? 'Yes' : 'No' }}
                                        </td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                                            <button
                                                v-if="!t.completed"
                                                @click="markDone(t.id)"
                                                class="text-xs sm:text-sm text-indigo-600 px-2 py-1 active:bg-indigo-50 rounded"
                                            >
                                                Mark
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="!upcoming7.length">
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500" colspan="6">No items.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <div
                            class="text-sm sm:text-base text-gray-600 mb-2 flex items-center gap-2 cursor-pointer py-2 -mx-2 px-2 active:bg-gray-100 rounded transition-colors"
                            @click="show30Days = !show30Days"
                        >
                            <span class="text-base">{{ show30Days ? '▼' : '▶' }}</span>
                            <span>Next 30 days</span>
                        </div>
                        <div v-if="show30Days" class="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Title</th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Due</th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden sm:table-cell">
                                            Recurrence
                                        </th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden md:table-cell">
                                            Life Area
                                        </th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden lg:table-cell">
                                            Completed
                                        </th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-100">
                                    <tr v-for="t in upcoming30" :key="t.id">
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm break-words max-w-xs">{{ t.text }}</td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                                            {{ parseNextDue(t) ? parseNextDue(t).format('YYYY-MM-DD') : '-' }}
                                        </td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">{{ getRecurrence(t) }}</td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{{ getLifeArea(t.tags) }}</td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                                            {{ t.completed ? 'Yes' : 'No' }}
                                        </td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                                            <button
                                                v-if="!t.completed"
                                                @click="markDone(t.id)"
                                                class="text-xs sm:text-sm text-indigo-600 px-2 py-1 active:bg-indigo-50 rounded"
                                            >
                                                Mark
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="!upcoming30.length">
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500" colspan="6">No items.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <div
                            class="text-sm sm:text-base text-gray-600 mb-2 flex items-center gap-2 cursor-pointer py-2 -mx-2 px-2 active:bg-gray-100 rounded transition-colors"
                            @click="showBeyond30 = !showBeyond30"
                        >
                            <span class="text-base">{{ showBeyond30 ? '▼' : '▶' }}</span>
                            <span>Beyond 30 days</span>
                        </div>
                        <div v-if="showBeyond30" class="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Title</th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Due</th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden sm:table-cell">
                                            Recurrence
                                        </th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden md:table-cell">
                                            Life Area
                                        </th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap hidden lg:table-cell">
                                            Completed
                                        </th>
                                        <th class="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-100">
                                    <tr v-for="t in upcomingBeyond" :key="t.id">
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm break-words max-w-xs">{{ t.text }}</td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                                            {{ parseNextDue(t) ? parseNextDue(t).format('YYYY-MM-DD') : '-' }}
                                        </td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">{{ getRecurrence(t) }}</td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{{ getLifeArea(t.tags) }}</td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                                            {{ t.completed ? 'Yes' : 'No' }}
                                        </td>
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                                            <button
                                                v-if="!t.completed"
                                                @click="markDone(t.id)"
                                                class="text-xs sm:text-sm text-indigo-600 px-2 py-1 active:bg-indigo-50 rounded"
                                            >
                                                Mark
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="!upcomingBeyond.length">
                                        <td class="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500" colspan="6">No items.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <!-- Today -->
            <section v-if="!showMissed" class="mb-2">
                <h3
                    class="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2 cursor-pointer py-2 -mx-2 px-2 active:bg-gray-100 rounded transition-colors"
                    @click="showToday = !showToday"
                >
                    <span class="text-lg">{{ showToday ? '▼' : '▶' }}</span>
                    <span>Today</span>
                </h3>
                <div v-if="showToday" class="space-y-2">
                    <TaskCard
                        v-for="t in today"
                        :key="t.id"
                        :task="t"
                        :onMark="markDone"
                        :showMark="true"
                        :showNotes="true"
                        @toggleNotes="toggleNotes"
                        :getLifeArea="getLifeArea"
                        :getTagNames="store.getTagNames"
                        :getRecurrence="getRecurrence"
                        :parseNextDue="parseNextDue"
                        :disabled="store.loading"
                    />
                    <div v-if="!today.length" class="text-sm text-gray-500">No tasks due today.</div>
                </div>
            </section>

            <!-- Upcoming -->
            <section v-if="!showMissed" class="my-4">
                <div class="space-y-3">
                    <div v-if="upcoming7.length">
                        <div
                            class="text-sm sm:text-base text-gray-600 mb-2 flex items-center gap-2 cursor-pointer py-2 -mx-2 px-2 active:bg-gray-100 rounded transition-colors"
                            @click="show7Days = !show7Days"
                        >
                            <span class="text-base">{{ show7Days ? '▼' : '▶' }}</span>
                            <span>Next 7 days</span>
                        </div>
                        <div v-if="show7Days" class="space-y-2">
                            <TaskCard
                                v-for="t in upcoming7"
                                :key="t.id"
                                :task="t"
                                :onMark="markDone"
                                :showMark="true"
                                :getLifeArea="getLifeArea"
                                :getTagNames="store.getTagNames"
                                :getRecurrence="getRecurrence"
                                :parseNextDue="parseNextDue"
                                :disabled="store.loading"
                                :showNotes="true"
                                @toggleNotes="toggleNotes"
                            />
                        </div>
                    </div>
                    <div v-if="upcoming30.length">
                        <div
                            class="text-sm sm:text-base text-gray-600 mb-2 flex items-center gap-2 cursor-pointer py-2 -mx-2 px-2 active:bg-gray-100 rounded transition-colors"
                            @click="show30Days = !show30Days"
                        >
                            <span class="text-base">{{ show30Days ? '▼' : '▶' }}</span>
                            <span>Next 30 days</span>
                        </div>
                        <div v-if="show30Days" class="space-y-2">
                            <TaskCard
                                v-for="t in upcoming30"
                                :key="t.id"
                                :task="t"
                                :onMark="markDone"
                                :showMark="true"
                                :getLifeArea="getLifeArea"
                                :getTagNames="store.getTagNames"
                                :getRecurrence="getRecurrence"
                                :parseNextDue="parseNextDue"
                                :disabled="store.loading"
                                :showNotes="true"
                                @toggleNotes="toggleNotes"
                            />
                        </div>
                    </div>
                    <div v-if="upcomingBeyond.length">
                        <div
                            class="text-sm sm:text-base text-gray-600 mb-2 flex items-center gap-2 cursor-pointer py-2 -mx-2 px-2 active:bg-gray-100 rounded transition-colors"
                            @click="showBeyond30 = !showBeyond30"
                        >
                            <span class="text-base">{{ showBeyond30 ? '▼' : '▶' }}</span>
                            <span>Beyond 30 days</span>
                        </div>
                        <div v-if="showBeyond30" class="space-y-2">
                            <TaskCard
                                v-for="t in upcomingBeyond"
                                :key="t.id"
                                :task="t"
                                :onMark="markDone"
                                :showMark="true"
                                :getLifeArea="getLifeArea"
                                :getTagNames="store.getTagNames"
                                :getRecurrence="getRecurrence"
                                :parseNextDue="parseNextDue"
                                :disabled="store.loading"
                                :showNotes="true"
                                @toggleNotes="toggleNotes"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <!-- Notes Modal -->
    <div v-if="notesTaskId" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" @click.self="notesTaskId = null">
        <div class="bg-white rounded-t-2xl sm:rounded-lg shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col" @click.stop>
            <div class="flex justify-between items-start mb-4">
                <h2 class="text-lg sm:text-xl font-bold pr-4 break-words">{{ notesTask?.text || 'Task Notes' }}</h2>
                <button
                    @click="notesTaskId = null"
                    class="text-gray-400 hover:text-gray-600 active:text-gray-800 text-3xl sm:text-2xl leading-none flex-shrink-0 w-10 h-10 flex items-center justify-center"
                >
                    &times;
                </button>
            </div>
            <textarea
                v-model="notesContent"
                @blur="saveNotes"
                class="w-full flex-1 min-h-[200px] sm:h-64 p-3 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                placeholder="Add notes for this task..."
            ></textarea>
            <div class="mt-4 text-xs sm:text-sm text-gray-500">Notes are saved automatically when you click outside the text area.</div>
        </div>
    </div>
</template>

<script>
import { computed, ref } from 'vue';
import TaskCard from './TaskCard.vue';

export default {
    components: { TaskCard },
    props: ['store', 'viewMode', 'showMissed'],
    setup(props) {
        const store = props.store;
        const showMissed = props.showMissed || false;
        const notesTaskId = ref(null);
        const notesContent = ref('');

        // Section visibility toggles
        const showToday = ref(true);
        const showUpcoming = ref(true);
        const show7Days = ref(true);
        const show30Days = ref(true);
        const showBeyond30 = ref(true);

        const notesTask = computed(() => {
            if (!notesTaskId.value) return null;
            return store.tasks.find(t => t.id === notesTaskId.value);
        });

        function toggleNotes(taskId) {
            notesTaskId.value = taskId;
            const task = store.tasks.find(t => t.id === taskId);
            notesContent.value = task?.notes || '';
        }

        function saveNotes() {
            if (notesTaskId.value) {
                store.updateTaskNotes(notesTaskId.value, notesContent.value);
            }
        }

        function matchesSelected(t) {
            // Use store.matchesFilters which includes tag + completion filters
            return store.matchesFilters ? store.matchesFilters(t) : true;
        }

        const today = computed(() => store.tasksDueToday().filter(t => matchesSelected(t)));

        const upcoming = computed(() => store.upcomingTasks());
        const upcoming7 = computed(() =>
            upcoming.value
                .filter(t => {
                    const d = store.parseNextDue(t);
                    if (!d) return false;
                    const diff = d.diff(new Date(), 'day');
                    return diff >= 0 && diff <= 7;
                })
                .filter(t => matchesSelected(t))
        );
        const upcoming30 = computed(() =>
            upcoming.value
                .filter(t => {
                    const d = store.parseNextDue(t);
                    if (!d) return false;
                    const diff = d.diff(new Date(), 'day');
                    return diff > 7 && diff <= 30;
                })
                .filter(t => matchesSelected(t))
        );
        const upcomingBeyond = computed(() =>
            upcoming.value
                .filter(t => {
                    const d = store.parseNextDue(t);
                    if (!d) return false;
                    const diff = d.diff(new Date(), 'day');
                    return diff > 30 && diff <= 365;
                })
                .filter(t => matchesSelected(t))
        );

        const missed = computed(() => store.missedTasks().filter(t => matchesSelected(t)));
        function groupMissed(items) {
            const buckets = [
                { title: 'Missed Weekly', rule: t => store.recurrence(t) === 'weekly', items: [] },
                { title: 'Missed Monthly', rule: t => store.recurrence(t) === 'monthly', items: [] },
                { title: 'Missed Quarterly', rule: t => store.recurrence(t) === 'quarterly', items: [] },
                { title: 'Missed Yearly', rule: t => store.recurrence(t) === 'yearly', items: [] },
            ];
            for (const t of items) {
                const b = buckets.find(bk => bk.rule(t));
                if (b) b.items.push(t);
            }
            return buckets;
        }

        const missedGroups = computed(() => groupMissed(missed.value));

        function markDone(id) {
            store.markDone(id);
        }

        function getLifeArea(tags) {
            return store.lifeAreaFromTags(tags);
        }
        function getRecurrence(t) {
            return store.recurrence(t);
        }
        function parseNextDue(t) {
            return store.parseNextDue(t);
        }

        const allFiltered = computed(() => (store.tasks || []).filter(t => (store.matchesFilters ? store.matchesFilters(t) : true)));
        const allSorted = computed(() => {
            return (allFiltered.value || []).slice().sort((a, b) => {
                const da = store.parseNextDue(a);
                const db = store.parseNextDue(b);
                if (da && db) {
                    if (da.isBefore(db)) return -1;
                    if (da.isAfter(db)) return 1;
                } else if (da && !db) return -1;
                else if (!da && db) return 1;
                return (a.text || '').localeCompare(b.text || '');
            });
        });

        return {
            today,
            upcoming7,
            upcoming30,
            upcomingBeyond,
            missedGroups,
            markDone,
            getLifeArea,
            getRecurrence,
            parseNextDue,
            store,
            showMissed,
            allSorted,
            notesTaskId,
            notesTask,
            notesContent,
            toggleNotes,
            saveNotes,
            showToday,
            showUpcoming,
            show7Days,
            show30Days,
            showBeyond30,
        };
    },
};
</script>
