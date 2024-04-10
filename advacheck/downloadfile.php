<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Provides a PDF verify report for download.
 * @package  plagiarism
 * @subpackage advacheck
 * @copyright © 1999 onwards Martin Dougiamas {@link http://moodle.com}
 * @copyright © 2023 onwards Advacheck OU
 * @license  http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require ('../../config.php');
require_once ($CFG->libdir . '/filelib.php');
require_once ('locallib.php');
require_once ('constants.php');

require_course_login($SITE);

$userid = required_param('userid', PARAM_INT);
$docid = required_param('docid', PARAM_INT);

$sql = "SELECT d.id, d.courseid, d.userid, d.docidantplgt, d.teacherid
        FROM {plagiarism_advacheck_docs} AS d
        WHERE d.id = ?";
$d = $DB->get_record_sql($sql, [$docid], IGNORE_MULTIPLE);

$afio = plagiarism_advacheck_get_autor_fio($userid);
$vfio = plagiarism_advacheck_get_verifier_fio($d->courseid, $d->teacherid);

$api = new plagiarism_advacheck\advacheck_api();
$d = $DB->get_record('plagiarism_advacheck_docs', ['id' => $docid]);
$pdf = $api->get_verification_report(unserialize($d->docidantplgt), $afio, $vfio);

if (is_string($pdf)) {
    // If an error occurs.
    $msg = get_string('downloadreport_error', 'plagiarism_advacheck', $pdf);
    echo "<script>alert(\"$msg\"); window.location.replace('{$_SERVER['HTTP_REFERER']}');</script>";
    exit;
} else {

    $filename = time() . "_report_$d->userid.pdf";
    // Reset the PHP output buffer to avoid overflowing the memory allocated for the script.
    // If this is not done, the file will be read into memory completely!
    if (ob_get_level()) {
        ob_end_clean();
    }
    // We force the browser to show the file saving window.
    header('Content-Description: inline');
    header('Content-Disposition: form-data; filename=' . basename($filename));
    // We display the contents of the file on the page.
    echo $pdf->GetVerificationReportResult;
    exit;
}
