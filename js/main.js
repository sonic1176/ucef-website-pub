!(function () {
    'use strict';
     let
        canvas, svg, group, link, nodes, simulation, color, globalData, circles;

    // Settings
    canvas = {
        width: window.innerWidth-5,
        height: window.innerHeight-5,
        viewbox: {
            x: 0,
            y: 0,
            width: 800,
            height: 500
        },
        padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        }
    };

    // Functions
    function setCanvas(contextSelector) {
        svg = d3.select(contextSelector)
            .append('svg')
            .attr('width', canvas.width-20)
            .attr('height', canvas.height-20)
            .attr('viewbox',
                canvas.viewbox.x + ' ' +
                canvas.viewbox.y + ' ' +
                canvas.viewbox.width + ' ' +
                canvas.viewbox.height);
    }

    function setGroup(id) {
        let _id = id || undefined;

        if (!_id) return false;

        try {
            group = svg.append('g')
                .attr('id', _id);
            let rG = group.append('defs').append('radialGradient')
                .attr('id', 'grad1')
                .attr('cx', '50%')
                .attr('cy', '50%')
                .attr('r', '50%')
                .attr('fx', '50%')
                .attr('fy', '50%');
                rG.append('stop')
                    .attr('offset', '0%')
                    .attr('style', 'stop-color:rgb(212, 147, 124)');
                rG.append('stop')
                .attr('offset', '100%')
                .attr('style', 'stop-color:rgb(207, 103, 51)');
            

        } catch (error) {
            console.log(error);
        }
        return true;
    }

    function createGraph(data) {
        let dataLinksBySource, dataLinksCount;

        globalData = data;

        dataLinksBySource = d3.nest()
            .key(function (d) {
                return d.source;
            })
            .entries(data.links);
        
        dataLinksCount = d3.nest()
            .key(function (d) {
                return d.source;
            })
            .rollup(function (v) {
                return v.length;
            })
            .object(data.links);
        simulation = d3.forceSimulation()
            .force('link', d3.forceLink()
                .id(function (d, i) {
                    return d.index;
                })
                .distance(function(d, i) {
                    return d.dist*120;
                })
                
            )
            .force('charge', d3.forceManyBody().strength(20))
            .force('center', d3.forceCenter(canvas.width / 2, canvas.height / 2))
            .force('collision', d3.forceCollide().radius(80))
            .velocityDecay(0.9);


        // Build the links
        link = group.append('g')
            .classed('links', true)
            .selectAll('line')
            .data(data.links)
            .enter()
            .append('line')
            .attr('style', function (d, i) {
                return 'stroke:rgb(83, 30, 36);stroke-width:3'
            })

        // Build the nodes  
        nodes = group.selectAll('circle')
            .data(data.nodes)
            .enter()
            .append('g')
            .classed('nodes', true)
            //.attr('transform', 'scale(1,1) rotate(0) translate(0,0)')
        nodes.insert('ellipse')
            .attr('fill', 'url(#grad1)')
            .attr('rx', function(d) {return 80*d.size;})
            .attr('ry', function(d) {return 30*d.size;})
            
        nodes.call(d3.drag()
                .on('start', onDragStart)
                .on('drag', onDrag)
                .on('end', onDragStop)
           )

        nodes.append('text')
            //.attr('transform', 'translate(5, 0) rotate(0)')
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-size", function(d) { return 16*d.size})
            .attr("fill", "white")
            .text(function (d, i) {
                return d.name;
            });

        // Realtime engine
        simulation
            .nodes(data.nodes)
            .on('tick', ticked)

        simulation.force('link')
            .links(data.links)
    }

    function ticked() {
        // draw links
        if (link) {
            link
                .attr('x1', function (d, i) {
                    return d.source.x;
                })
                .attr('y1', function (d, i) {
                    return d.source.y;
                })
                .attr('x2', function (d, i) {
                    return d.target.x;
                })
                .attr('y2', function (d, i) {
                    return d.target.y;
                });
        }

        // draw nodes
        if (nodes) {
            nodes.attr('transform', function (d, i) {
                return 'scale(1,1) rotate(0) translate(' + d.x + ',' + d.y + ')';
            });
        }
    }

    function onDragStart(node) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        node.fx = node.x;
        node.fy = node.y;
    }

    function onDrag(node) {

        node.fx = d3.event.x;
        node.fy = d3.event.y;
    }

    function onDragStop(node) {
        if (!d3.event.active) simulation
            .alphaTarget(0)
            .restart();
        node.fx = null;
        node.fy = null;
    }

    // Control
    setCanvas('#diagram');
    setGroup('root');

    d3
        .json('data/data.json')
        .then(createGraph);

    //- - - - - - - - - -
}());