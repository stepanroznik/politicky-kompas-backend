<template>
    <div class="about leading-6 text-left">
        <h2 class="text-xl font-semibold pb-8">
            Politický kompas Politica.cz je volební kalkulačka, která se snaží být především srozumitelná a zábavná.
        </h2>
        <div class="grid sm:grid-cols-2">
            <div class="flex flex-col gap-6 text-md">
                <p>
                    Hlavní motivací k jejímu vytvoření byly negativní zkušenosti lidí v mém okolí s ostatními volebními kalkulačkami, u kterých měli většinou problém udržet pozornost a mnohým otázkám nerozuměli. 
                </p>
                <p>
                    Tímto projektem se snažím více zpřístupnit politiku lidem, kteří se o ni dříve nezajímali a v nejlepším případě je dostat k volbám.
                </p>
                <div>
                    Téměř všechny otázky a odpovědi na ně jsem si vypůjčil z webů jiných politických kalkulaček, jmenovitě:
                    <li 
                        v-for="website in websites"
                        :key="website"
                    >
                        <a
                            :href="'https://' + website"
                            class="underline break-words"
                            style="word-break: break-all;"
                        > {{ website }}</a>
                    </li>
                </div>
                <p>
                    Snažím se přitom vybírat hlavně takové otázky, které pochopí opravdu každý a formulovat je co nejsrozumitelněji.
                </p>
            </div>
            <div
                class="bg-contain bg-no-repeat bg-center"
                :style="{backgroundImage: `url(${aboutImage})`}"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import aboutImage from '../assets/compass.png';

const websites = ['2021.programydovoleb.cz/volebni-kalkulacka', 'irozhlas.cz/volebni-kompas-2021', 'zpravy.aktualne.cz/domaci/r~6c11947803f211eca1070cc47ab5f122/', 'volebnikalkulacka.cz/', 'idnes.cz/volby/kalkulacka', '8values.github.io/'];
</script>
