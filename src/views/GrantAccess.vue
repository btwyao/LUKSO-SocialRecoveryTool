<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const isPending = ref(false);
const upAddress = ref("");
const recoverProcessId = ref("");
const newOwnerAddress = ref("");

const vote = async (
  upAddress: string,
  recoverProcessId: string,
  newOwnerAddress: string
) => {
  console.log("vote:", upAddress, recoverProcessId, newOwnerAddress);
  //todo
};
</script>
<template>
  <div
    v-if="
      route.query.upAddress &&
      route.query.recoverProcessId &&
      route.query.newOwnerAddress
    "
  >
    <div class="tile is-ancestor">
      <div class="tile is-child box">
        <div class="field">
          <label class="label">Universal Profile address</label>
          <label class="label">{{ route.query.upAddress }}</label>
        </div>
        <div class="field">
          <label class="label">Recover process id</label>
          <label class="label">{{ route.query.recoverProcessId }}</label>
        </div>
        <div class="field">
          <label class="label">New owner address</label>
          <label class="label">{{ route.query.newOwnerAddress }}</label>
        </div>
        <div class="field">
          <button
            :class="`button is-primary is-rounded mb-3 ${
              isPending ? 'is-loading' : ''
            }`"
            data-testid="vote"
            @click="
              vote(
                route.query.upAddress as string,
                route.query.recoverProcessId as string,
                route.query.newOwnerAddress as string
              )
            "
          >
            vote
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="tile is-ancestor">
      <div class="tile is-child box">
        <div class="field">
          <label class="label">Universal Profile address</label>
          <div class="control">
            <input v-model="upAddress" class="input" type="text" />
          </div>
        </div>
        <div class="field">
          <label class="label">Recover process id</label>
          <div class="control">
            <input v-model="recoverProcessId" class="input" type="text" />
          </div>
        </div>
        <div class="field">
          <label class="label">New owner address</label>
          <div class="control">
            <input v-model="newOwnerAddress" class="input" type="text" />
          </div>
        </div>
        <div class="field">
          <button
            :class="`button is-primary is-rounded mb-3 ${
              isPending ? 'is-loading' : ''
            }`"
            data-testid="vote"
            @click="vote(upAddress, recoverProcessId, newOwnerAddress)"
          >
            vote
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
