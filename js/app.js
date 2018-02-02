$(document).ready(function () {

    var apiUrl = "http://ale.dev/api/";

    // popular o combo de cells
    $(function () {

        $(".cell-select").select2({
            placeholder: "Cell",
            allowClear: true
        });

        $.getJSON(
                apiUrl + 'cells',
                function (data) {
                    $.each(data, function (i, cell) {
                        $(".cell-select").append('<option value="' + cell.id + '">' + cell.name + '</option>');
                    });
                }
        );
    });

    // popular os componentes
    $(function () {
        $('.cell-select').on('select2:select', function (e) {
            var selData = e.params.data;

            $('#componentTree').jstree({
                core: {
                    data: function (node, cb) {
                        
                        var components = [];
                        var lines = [];
                        
                        $.ajax({url: apiUrl + 'cell/' + selData.id + '/components'}).done(function (data) {
                            var i, j;

                            for (var i = 0, j = data.length; i < j; i++) {

                                // roles
                                var roles = [];
                                $.each(data[i].roles, function (key, val) {

                                    var roleParams = [];

                                    $.each(val.params, function (rKey, rVal) {
                                        roleParams.push({
                                            'text': rVal.name,
                                            'id': rVal.id,
                                            "icon": "fa fa-pencil-square-o ",
                                            "data": rVal
                                        });
                                    });

                                    roles.push({
                                        'text': val.name,
                                        'id': val.id,
                                        'children': roleParams,
                                        'data': val
                                    });
                                });

                                // hostgroups
                                var hostgroups = [];
                                $.each(data[i].hostgroups, function (key, val) {
                                    hostgroups.push({
                                        'text': val.name,
                                        'id': val.id,
                                        'data': val
                                    });
                                });

                                components.push({
                                    'id': data[i].id,
                                    'text': data[i].name,
                                    'data': data[i],
                                    'children': [
                                        {
                                            'text': 'Hostgroups',
                                            'children': hostgroups
                                        },
                                        {
                                            'text': 'Roles',
                                            'children': roles
                                        }
                                    ]
                                });
                            }
                            
                            lines.push( {
                                'id': 1,
                                'text': 'Components',
                                'children': components
                            });
                            
                            //  consultar os providers
                            getProviders( lines );

                        });
                        
                        function getProviders( lines ) {
                            
                            var providers = [];
                            
                            $.ajax({url: apiUrl + 'cell/' + selData.id + '/provider'}).done(function (data) {
                                
                                $.each(data, function(key,val) {
                                    providers.push({
                                        'id': key,
                                        'text': key,
                                        'icon': 'fa fa-puzzle-piece',
                                        'data': {
                                            [key] : val
                                        }
                                    });
                                });
                                
                                lines.push( {
                                    'id': 2,
                                    'text': 'Providers',
                                    'children': providers
                                });
                                
                                getKeyPairs ( lines );
                                
                            });
                        }
                        
                        function getKeyPairs ( lines ) {
                            
                            var keyPairs = [];
                            
                            $.ajax({url: apiUrl + 'keypairs'}).done(function (data) {
                                
                                 var i, j;

                                 for (var i = 0, j = data.length; i < j; i++) {
                                    keyPairs.push({
                                        'id': data[i].id,
                                        'icon': 'fa fa-key',
                                        'text': data[i].name,
                                        'data': data[i]
                                    });
                                }
                                
                                lines.push( {
                                    'id': 3,
                                    'text': 'Keypairs',
                                    'children': keyPairs
                                });
                                
                                cb(lines); 
                                
                            });
                            
                        }
                        
                    }
                }
            });

        });
    });

    // seleção de componente
    $("#componentTree").bind(
            "select_node.jstree", function (evt, data) {

                $("#formConfig").empty();

                $.each(data.node.data, function (key, val) {

                    if (val !== null && typeof val !== 'object') {
                        // criar item do form 
                        var html = '<div class="form-group">'
                                + '<label class="col-sm-2 control-label" for="' + key + '">' + key + '</label>'
                                + '<div class="col-sm-8">'
                                + '<input type="text" class="form-control" value="' + val + '" id="' + key + '">'
                                + '</div>'
                                + '</div>';
                        $(html).appendTo("#formConfig");
                    }

                });
            }
    );
});