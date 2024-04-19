define(['jquery', 'core/tree'], function ($) {
    return {
        // To remember the ID of the documents being processed.
        processingDocs: [],
        addPlagiarismCtrlButtons: function () {
            var app = this;
            $(document).ready(function () {
                // For "chechking status" display progress circle
                $(".checking_img").css("display", "inline");
                return false;
            });
            // Update verify report 
            $(document).on('click', '.update_report', function () {
                var typeid = $($(".typeid", $(this).parent())[0]).text();
                // Remember typeid processing doc, else return from function.
                if (!app.processingDocs[typeid]) {
                    app.processingDocs[typeid] = 1;
                } else {
                    return false;
                }
                $.ajax({
                    url: M.cfg.wwwroot + "/plagiarism/advacheck/ajax.php",
                    method: "POST",
                    dataType: "html",
                    data: {
                        action: "update_report",
                        typeid: typeid,
                        sesskey: M.cfg.sesskey
                    },
                    success: function (data) { app.setVerfyResult(data, typeid); },
                    error: function (request, status, error) {
                        console.log(error);
                        console.log(typeid);
                        console.log(request);
                        console.log(status);
                    }
                });
                return false;
            });
            // Initiates upload file or submittiontext to server AP
            $(document).on('click', '.advacheck-checkbtn', function () {
                var TmpClases = $(this).attr('class').split(/\s+/);
                var typeid = TmpClases[1];
                // Remember typeid processing doc, else return from function.
                if (!app.processingDocs[typeid]) {
                    app.processingDocs[typeid] = 1;
                } else {
                    return false;
                }

                var doctype = $($(".advacheck-data." + typeid + " .doctype")[0]).text();
                var courseid = $($(".advacheck-data." + typeid + " .courseid")[0]).text();

                if (doctype != 1) {
                    var params = {
                        "action": "checktext",
                        "typeid": typeid,
                        "doctype": doctype,
                        "courseid": courseid,
                        "assignment": $($(".advacheck-data." + typeid + " .assignment")[0]).text(),
                        "discussion": $($(".advacheck-data." + typeid + " .discussion")[0]).text(),
                        "userid": $($(".advacheck-data." + typeid + " .userid")[0]).text(),
                        "content": $($(".advacheck-data." + typeid + " .content")[0]).text(),
                        "sesskey": M.cfg.sesskey
                    }
                } else {
                    var params = {
                        "typeid": typeid,
                        "action": "checkfile",
                        "courseid": courseid,
                        "sesskey": M.cfg.sesskey
                    }
                }

                // var p = $(this).parent();
                // Hide the button
                $(".advacheck-checkbtn." + typeid).hide();
                // Show the loader img
                $(".advacheck-loader." + typeid).show();
                $(".advacheck-data.advacheck-green.checking." + typeid).css("display", "inline-grid");
                $(".advacheck-data.advacheck-green.checking." + typeid).show();

                $.ajax({
                    url: M.cfg.wwwroot + "/plagiarism/advacheck/ajax.php",
                    sesskey: M.cfg.sesskey,
                    method: "POST",
                    dataType: "html",
                    cache: false,
                    data: params,
                    success: function (data) { app.setVerfyResult(data, typeid); },
                    error: function (request, status, error) {
                        console.log(error);
                        console.log(params);
                        console.log(request);
                        console.log(status);
                    }
                });
                return false;
            });
        },
        // Array for intervalIds
        verifyStatus: [],
        /**
         * Make request to get verify resurts
         * @param {*} typeid fileid/text hash
         * @param {*} app Current scope
         */
        updateVerifyResult: function (typeid, app) {
            $.ajax({
                url: M.cfg.wwwroot + "/plagiarism/advacheck/ajax.php",
                method: "POST",
                dataType: "html",
                data: {
                    action: "update_report",
                    typeid: typeid,
                    "sesskey": M.cfg.sesskey
                },
                success: function (data) { app.setVerfyResult(data, typeid) },
                error: function (request, status, error) {
                    console.log(error);
                    console.log(typeid);
                    console.log(request);
                    console.log(status);

                }
            });
        },
        setVerfyResult: function (data, typeid) {
            try {
                data = JSON.parse(data);
                // If this field is received, then we will update the line with draft checks.
                if (data.check_studs) {
                    if (data.check_studs === 'none') {
                        // If there are no checks left, then we will hide the block.
                        $(".stud_check-" + typeid).hide();
                    } else {
                        $(".stud_check-" + typeid).html(data.check_studs);
                    }
                }

                if (data.status == 4 || data.status == 5) {
                    // Hide progress circle
                    $(".advacheck-loader." + typeid).hide();
                    $(".advacheck-data.advacheck-green.checking." + typeid).hide();
                    // Hide info block
                    $(".check_notice-" + typeid).hide();

                    if (data.docid) {
                        $(".advacheck-data." + typeid + " .docid").html(data.docid);
                    }
                    // Add plagiarism.
                    if (data.plagiarism) {
                        $("span.plagiarism-" + typeid).html(data.plagiarism);
                    }
                    // Add selfcite.
                    if (data.selfcite) {
                        $("span.selfcite-" + typeid).html(data.selfcite);
                    }
                    // Add legal.
                    if (data.legal) {
                        $("span.legal-" + typeid).html(data.legal);
                    }
                    // Add originality.
                    if (data.originality) {
                        $("span.originality-" + typeid).html(data.originality);
                    }
                    // Suspicious doc icon
                    if (data.issuspicious && data.report) {
                        $("span.advacheck-suspicious-" + typeid).css("display", "inline-block");
                        $("span.advacheck-suspicious-" + typeid).attr('href', data.report).show();
                    }
                    // Link to report
                    if (data.report) {
                        $(".advacheck-report-" + typeid).attr('href', data.report).show();
                        // Suspicious doc icon
                        if (data.issuspicious) {
                            $("span." + typeid + ".advacheck-suspicious").css("display", "inline-block")
                            $("a." + typeid + ".advacheck-suspicious_lnk").attr('href', data.report).show();
                        }
                    }
                    // Help icon
                    $(".advacheck_help." + typeid).show();
                    if (data.class) {
                        // Change background color 
                        $(".advacheck." + typeid).attr("class", "advacheck " + typeid + " " + data.class);
                    }
                    // Display and add style to verify result.
                    $(".advacheck." + typeid).css("display", "inline-block");
                    $(".advacheck." + typeid).css("-webkit-border-radius", "4px");
                    $(".advacheck." + typeid).css("-moz-border-radius", "4px");
                    $(".advacheck." + typeid).css("border-radius", "4px");
                    $(".advacheck." + typeid).css("padding", "3px 7px");
                    $(".advacheck." + typeid).css("font-size", "80%");
                    $(".advacheck." + typeid).css("line-height", "110%");
                    $(".advacheck." + typeid).show();
                    // If started a cycle of waiting for results on this document. Stop cycle.
                    if (this.verifyStatus[typeid]) {
                        clearInterval(this.verifyStatus[typeid]);
                    }
                    // Forget typeid processing doc
                    if (this.processingDocs[typeid]) {
                        delete this.processingDocs[typeid];
                    }
                } else if (data.error) {
                    $(".advacheck." + typeid).attr("class", "advacheck-" + typeid + " " + data.class);
                    $(".advacheck." + typeid).html(data.error);
                    // If started a cycle of waiting for results on this document. Stop cycle.
                    if (this.verifyStatus[typeid]) {
                        clearInterval(this.verifyStatus[typeid]);
                    }
                    // Forget typeid processing doc
                    if (this.processingDocs[typeid]) {
                        delete this.processingDocs[typeid];
                    }
                } else {
                    // If you have not started a cycle of waiting for results on this document.
                    if (!this.verifyStatus[typeid]) {
                        this.verifyStatus[typeid] = setInterval(this.updateVerifyResult, 60 * 1000, typeid, this);
                    }
                }
            } catch (e) {
                // If there is an error, see the console.
                // Let's put the check button back.
                $(".advacheck-checkbtn." + typeid).show();
                $(".advacheck-loader." + typeid).hide();
                // We will display an error message.
                $(".advacheck." + typeid).html(data.error).show();
                console.log(e.message);
                console.log(data);
                // If started a cycle of waiting for results on this document. Stop cycle.
                if (this.verifyStatus[typeid]) {
                    clearInterval(this.verifyStatus[typeid]);
                }
                if (this.processingDocs[typeid]) {
                    delete this.processingDocs[typeid];
                }
            }
            return false;
        },
        // Check tarif and display info about tarif.
        checkTarif: function () {
            $(document).on('click', '.test-tarif', function () {
                // We take the login and password from the form.
                var login = $("#id_login").val();
                var password = $("#id_password").val();
                var soap_wsdl = $("#id_soap_wsdl").val();
                var uri = $("#id_uri").val();
                $("#id_tarif_info").show();
                var params = {
                    action: "checktarif",
                    login: login,
                    password: password,
                    soap_wsdl: soap_wsdl,
                    uri: uri,
                    "sesskey": M.cfg.sesskey
                };
                $.ajax({
                    url: M.cfg.wwwroot + "/plagiarism/advacheck/ajax.php",
                    method: "POST",
                    dataType: "html",
                    data: params,
                    success: function (data) {
                        data = JSON.parse(data);
                        if (data.message) {
                            $("#id_tarif_info").html(data.message);
                            $("#id_tarif_info").show();
                        }
                    },
                    error: function (request, status, error) {
                        console.log(error);
                        console.log(params);
                        console.log(request);
                        console.log(status);
                    }
                });
                return false;
            });
        },
        // Change verify mode for course module
        changeMode: function () {
            $(".changetype").change(function () {

                var doctype = $(this).attr('name');
                var value = null;
                var cm = null;

                if (doctype === 'disp_notices' || doctype === 'check_stud_lim' || doctype === 'works_types') {
                    // Selected value.
                    value = $(this).val();
                    var cl = $(this).attr('class').split(" ");
                    // The last element is the module ID.
                    cm = cl[cl.length - 1];
                } else {
                    cm = $(this).val();
                    value = Number($(this).is(':checked'));
                }
                $.ajax({
                    url: M.cfg.wwwroot + "/plagiarism/advacheck/ajax.php",
                    method: "POST",
                    data: {
                        action: "changetype",
                        cm: cm,
                        doctype: doctype,
                        value: value,
                        "sesskey": M.cfg.sesskey
                    }
                });
            });

            $(".changemode").change(function () {
                var cm = $(this).attr('name');
                var mode = $(this).val();
                $.ajax({
                    url: M.cfg.wwwroot + "/plagiarism/advacheck/ajax.php",
                    method: "POST",
                    data: {
                        action: "changeMode",
                        cm: cm,
                        mode: mode,
                        "sesskey": M.cfg.sesskey
                    }
                });
            });
        },
    };
});