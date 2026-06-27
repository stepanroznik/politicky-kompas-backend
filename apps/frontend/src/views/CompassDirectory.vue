<template>
  <section class="mx-auto max-w-5xl text-left">
    <div class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Rozcestník
      </p>
      <h1 class="mt-2 text-3xl font-semibold text-gray-950 sm:text-4xl">
        Vyberte politickou kalkulačku
      </h1>
      <p class="mt-3 max-w-2xl text-gray-600">
        Každá kalkulačka má vlastní otázky, vlastní vysvětlení a samostatné výsledky.
      </p>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <article class="flex flex-col gap-3 border border-gray-300 bg-white p-5 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-950">
          Obecný politický kompas
          <span class="ml-2 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            beta
          </span>
        </h2>
        <div class="space-y-3 mb-3 text-sm text-gray-600">
          <p>
            Připravovaná obecnější kalkulačka. Není stavěná jen kolem jedněch voleb, ale kolem širších politických postojů a dlouhodobějšího směru stran.
          </p>
          <p>
            Výsledek ukazuje čtyři barevné 2D kompasy: zahraniční politiku, ekonomiku, společnost a instituce se svobodami. Zatím je v beta verzi, protože otázky i stranické odpovědi budeme ještě dolaďovat.
          </p>
        </div>
        <button
          class="mt-auto bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-black"
          type="button"
          @click="$router.push('/obecny-kompas')"
        >
          Otevřít obecný kompas
        </button>
      </article>

      <article class="flex flex-col gap-3 border border-gray-300 bg-white p-5 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-950">
          Sněmovní kompas 2021
        </h2>
        <div class="space-y-3 mb-3 text-sm text-gray-600">
          <p>
            Archivní kratší kalkulačka pro sněmovní volby. Má původní dvouosý kompas, původní otázky a samostatné odpovědi tehdejších stran.
          </p>
          <p>
            Je vhodná hlavně jako srovnání s původním projektem a jako jednodušší varianta pro lidi, kteří chtějí rychlý výsledek bez více dimenzí.
          </p>
        </div>
        <button
          class="mt-auto border border-gray-400 px-5 py-3 font-semibold text-gray-900 transition hover:border-gray-900"
          type="button"
          @click="$router.push('/')"
        >
          Otevřít sněmovní kompas
        </button>
      </article>
    </div>
  </section>
</template>
