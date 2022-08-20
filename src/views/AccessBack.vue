<script setup lang="ts">
import { ref } from "vue";
import { useAccessBack } from "@/stores/accessBack";
const accessBackStore = useAccessBack();
const step = ref(1);
const isPending = ref(false);

//step 1
const upAddress = ref("");
upAddress.value = accessBackStore.upAddress;

const enterUPAddress = async () => {
  //todo
  step.value = 2;
};

//step 2
const newRecoverProcessId = ref("");

const createRecoverProcess = async () => {
  //todo
};

const toRecoverOwnership = async (processId: string) => {
  //todo
  recoverProcessId.value = processId;
  step.value = 3;
};

//step 3
const recoverProcessId = ref("");
const password = ref("");

const recoverOwnership = async () => {
  //todo
};
</script>
<template>
  <div v-if="step === 1" data-testid="step1">
    <div class="tile is-ancestor">
      <div class="tile is-child box">
        <div class="field">
          <label class="label">Universal Profile address</label>
          <div class="control">
            <input v-model="upAddress" class="input" type="text" />
          </div>
        </div>
        <div class="field">
          <button
            :class="`button is-primary is-rounded mb-3 ${
              isPending ? 'is-loading' : ''
            }`"
            data-testid="enterUPAddress"
            @click="enterUPAddress"
          >
            next
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="step === 2 && accessBackStore.upAddress.length > 0"
    data-testid="step2"
  >
    <div class="tile is-ancestor">
      <div class="tile is-vertical is-parent is-12">
        <div class="tile is-child box">
          <div class="field">
            <label class="label">create new recover process:</label>
          </div>
          <div class="field">
            <label class="label">recover process id</label>
            <div class="control">
              <input v-model="newRecoverProcessId" class="input" type="text" />
            </div>
          </div>
          <div class="field">
            <button
              :class="`button is-primary is-rounded mb-3 ${
                isPending ? 'is-loading' : ''
              }`"
              data-testid="createRecoverProcess"
              @click="createRecoverProcess"
            >
              create
            </button>
          </div>
        </div>

        <div class="tile is-child box">
          <div class="field">
            <label class="label">guardians:</label>
            <ul>
              <li
                v-for="item in accessBackStore.guardianAddressList"
                :key="item"
              >
                {{ item }}
              </li>
            </ul>
          </div>
          <div class="field">
            <label class="label"
              >guardians threshold:
              {{ accessBackStore.guardianThreshold }}</label
            >
          </div>
          <div
            v-if="accessBackStore.recoverProcessList.length > 0"
            data-testid="recoverProcessList"
            class="field table-container"
          >
            <table
              class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
            >
              <thead>
                <tr>
                  <th>Process id</th>
                  <th>Guardians voted</th>
                  <th>Grant access url</th>
                  <th>Operation</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="process in accessBackStore.recoverProcessList"
                  :key="process.processId"
                >
                  <td>{{ process.processId }}</td>
                  <td>{{ process.guardiansVoted.join(";") }}</td>
                  <td>{{ process.grantAccessUrl }}</td>
                  <td>
                    <button
                      :class="`button is-primary is-rounded mb-3 ${
                        isPending ? 'is-loading' : ''
                      }`"
                      :disabled="
                        process.guardiansVoted.length >=
                        accessBackStore.guardianThreshold
                          ? undefined
                          : true
                      "
                      data-testid="toRecoverOwnership"
                      @click="toRecoverOwnership(process.processId)"
                    >
                      To recover
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="step === 3 && recoverProcessId.length > 0" data-testid="step3">
    <div class="tile is-ancestor">
      <div class="tile is-child box">
        <div class="field">
          <label class="label">Recover ownership:</label>
        </div>
        <div class="field">
          <label class="label">recover process id:{{ recoverProcessId }}</label>
        </div>
        <div class="field">
          <label class="label">password</label>
          <div class="control">
            <input v-model="password" class="input" type="text" />
          </div>
        </div>
        <div class="field">
          <button
            :class="`button is-primary is-rounded mb-3 ${
              isPending ? 'is-loading' : ''
            }`"
            data-testid="recoverOwnership"
            @click="recoverOwnership"
          >
            Recover ownership
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
