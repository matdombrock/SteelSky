<!-- 
Templates that will only be used once per page can have all their stuff in one file 
-->

<div id="jumbo">
    <canvas id="jumbo-canvas"></canvas>
    <img src="/img/logo.png">
</div>
<div id="jumbo-spacer"></div>

<script src="/js/mountains.js"></script>
<script>
const mountains = new MountainsDrawer('jumbo-canvas');
</script>


<style>
:root {
    --jumbo-height: 20vh;
}
#jumbo {
    position: absolute;
    top: var(--header-height);
    left: 0;
    width: 100%;
    background: linear-gradient(to right, var(--accent), var(--accent2));
    height: var(--jumbo-height);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: var(--shadow);
}
#jumbo img {
    position: relative;
    bottom: 0;
    max-height: 90%;
    max-width: 90%;
    box-shadow: none;
}
#jumbo-spacer {
    height: var(--jumbo-height);
}
#jumbo-canvas {
    height: var(--jumbo-height);
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
}
</style>
