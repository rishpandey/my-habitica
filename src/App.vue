<template>
    <div class="max-w-4xl mx-auto p-6">
        <header class="mb-4">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-2xl font-bold">Habitica Dashboard</h1>
                <div class="flex items-center gap-3">
                    <input v-model="localUser" placeholder="HABITICA_USER_ID" class="border rounded px-2 py-1 text-sm" />
                    <input v-model="localKey" placeholder="HABITICA_API_KEY" class="border rounded px-2 py-1 text-sm" />
                    <button @click="saveCreds" class="bg-indigo-600 text-white px-3 py-1 rounded text-sm">Save</button>
                </div>
            </div>
            <div v-if="store.availableTags && store.availableTags.length" class="mb-3">
                <div class="flex items-center gap-2 flex-wrap">
                    <div class="text-sm text-gray-600 mr-2">Filter tags:</div>
                    <button
                        v-for="tag in store.availableTags"
                        :key="tag"
                        @click="store.toggleTag(tag)"
                        :class="[
                            'text-sm px-2 py-1 rounded border',
                            store.selectedTags && store.selectedTags.includes(tag) ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700',
                        ]"
                    >
                        {{ tag }}
                    </button>
                    <button
                        v-if="store.selectedTags && store.selectedTags.length"
                        @click="store.clearSelectedTags()"
                        class="ml-2 text-sm px-2 py-1 rounded border bg-gray-100"
                    >
                        Clear
                    </button>
                </div>
            </div>
            <div class="flex justify-between">
                <div class="mb-2">
                    <div class="flex items-center gap-2">
                        <button
                            @click="store.setCompletionFilter('all')"
                            :class="[
                                'text-sm px-2 py-1 rounded border',
                                store.completionFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700',
                            ]"
                        >
                            All
                        </button>
                        <button
                            @click="store.setCompletionFilter('not-done')"
                            :class="[
                                'text-sm px-2 py-1 rounded border',
                                store.completionFilter === 'not-done' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700',
                            ]"
                        >
                            Not done
                        </button>
                        <button
                            @click="store.setCompletionFilter('done')"
                            :class="[
                                'text-sm px-2 py-1 rounded border',
                                store.completionFilter === 'done' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700',
                            ]"
                        >
                            Done
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="flex items-center gap-2">
                        <button
                            @click="viewMode = 'list'"
                            :class="['text-sm px-2 py-1 rounded border', viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700']"
                        >
                            List
                        </button>
                        <button
                            @click="viewMode = 'table'"
                            :class="['text-sm px-2 py-1 rounded border', viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700']"
                        >
                            Table
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="store.hasCreds" class="mb-2">
                <HeaderStats :user="store.user" :headerStats="store.headerStats" :dueCount="store.dueTodayCount()" />
            </div>
            <div v-else class="text-sm text-gray-600">Enter your Habitica credentials above to load data (stored locally).</div>
        </header>

        <main>
            <div class="mb-3">
                <nav class="flex gap-2">
                    <div
                        :class="['px-3 py-1 rounded cursor-pointer', activeTab === 'dashboard' ? 'bg-white shadow' : 'bg-gray-100']"
                        @click="activeTab = 'dashboard'"
                    >
                        Dashboard
                    </div>
                    <div
                        :class="['px-3 py-1 rounded cursor-pointer', activeTab === 'missed' ? 'bg-white shadow' : 'bg-gray-100']"
                        @click="activeTab = 'missed'"
                    >
                        Missed
                    </div>
                    <div :class="['px-3 py-1 rounded cursor-pointer', activeTab === 'past' ? 'bg-white shadow' : 'bg-gray-100']" @click="activeTab = 'past'">
                        Past
                    </div>
                </nav>
            </div>

            <div>
                <!-- Global spinner -->
                <div v-if="store.loading" class="fixed inset-0 bg-black/20 flex items-center justify-center">
                    <div class="bg-white px-4 py-2 rounded shadow">Loading…</div>
                </div>
                <!-- Toast -->
                <div v-if="store.toastMessage" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow">
                    {{ store.toastMessage }}
                </div>
                <div v-show="activeTab === 'dashboard'">
                    <Dashboard v-if="store.hasCreds" :store="store" :viewMode="viewMode" :show-missed="false" />
                    <div v-else class="text-sm text-gray-500">Provide credentials to view your dashboard.</div>
                </div>
                <div v-show="activeTab === 'missed'">
                    <Dashboard v-if="store.hasCreds" :store="store" :viewMode="viewMode" :show-missed="true" />
                    <div v-else class="text-sm text-gray-500">Provide credentials to view missed tasks.</div>
                </div>
                <div v-show="activeTab === 'past'">
                    <Past :store="store" />
                </div>
            </div>
        </main>
    </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import { useHabiticaStore } from './stores/useHabiticaStore';
import HeaderStats from './components/HeaderStats.vue';
import Dashboard from './components/Dashboard.vue';
import Past from './components/Past.vue';

export default {
    components: { HeaderStats, Dashboard, Past },
    setup() {
        const store = useHabiticaStore();
        const localUser = ref(store.userId);
        const localKey = ref(store.apiKey);
        const activeTab = ref('dashboard');
        const viewMode = ref('list');

        function saveCreds() {
            store.setUserId(localUser.value);
            store.setApiKey(localKey.value);
            // auto refresh
            store.refreshAll();
        }

        // auto-fetch when credentials are present on mount
        onMounted(() => {
            if (store.hasCreds) store.refreshAll();
        });

        // keep inputs synced if store changes externally
        watch(
            () => store.userId,
            v => (localUser.value = v)
        );
        watch(
            () => store.apiKey,
            v => (localKey.value = v)
        );

        return { store, localUser, localKey, activeTab, saveCreds, viewMode };
    },
};
</script>
