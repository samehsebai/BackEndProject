const Etudiant = require("../../Models/Compte"); 
const bcrypt = require("bcryptjs");
const Excel = require("exceljs");

exports.FetchEtudiant = async (req, res) => {
  try {
    const Result = await Etudiant.find({ role: "Etudiant" });

    res.send(Result);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.FetchEtudiantById = async (req, res) => {
  try {
    const Result = await Etudiant.findById(req.params.idEtudiant);

    res.send(Result);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.FetchEtudiantPublic = async (req, res) => {
  try {
    const Result = await Etudiant.find({ visibilite: true });

    res.send(Result);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.UpdateEtudiant = async (req, res) => {
  console.log(req.params);
  try {
    // const salt = bcrypt.genSaltSync(10);
    // req.body.passwordHashed = bcrypt.hashSync(req.body.password, salt);
    const Result = await Etudiant.findByIdAndUpdate(
      req.params.idEtudiant,
      req.body
    );

    const Resultupdate = await Etudiant.findById(req.params.idEtudiant);

    res.send(Resultupdate);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.UpdateEtudiantVisibility = async (req, res) => {
  try {
    const Result = await Etudiant.findByIdAndUpdate(
      req.params.idEtudiant,
      req.body
    );

    const Resultupdate = await Etudiant.findById(req.params.idEtudiant);

    res.send(Resultupdate);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.DeleteEtudiant = async (req, res) => {
  try {
    const Result = await Etudiant.findByIdAndDelete(req.params.idEtudiant);

    res.status(200).send("Etudiant deleted with success");
  } catch (error) {
    res.status(500).send("error serveur");
  }
};

exports.uploadMultiple = async (req, res) => {
  try {
    // console.log("file", req.file)
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(
        parse({
          Comment: "#",
          relax_column_count: true,
          columns: true,
          delimiter: ";",
        })
      )
      .on("data", (data) => {
        results.push(data);
      })
      .on("error", (err) => {
        res.status(500).send({ Message: "Server Error", Error: error.message });
      })
      .on("end", async () => {
        results.pop();
        console.log("popped", results);
        results.forEach(async (student) => {
          student.password = randomString(
            12,
            "abcdefghijklmnopqrstuvwxyz0123456789"
          );
          // try {
          //   await sendAcount(student)
          // } catch (error) {
          //   console.log("##########:", error);
          //   res.status(500).send({ Message: "Server Error", Error: error.message });
          // }
        });
        const createdEtudiant = await Etudiant.create(results);
        return res
          .status(200)
          .json({
            Message: "Etudiant(s) uploaded successfully",
            data: createdEtudiant,
          });
      });
  } catch (error) {
    console.log("##########:", error);
    res.status(500).send({ Message: "Server Error", Error: error.message });
  }
};

exports.updateSeason = async (req,res) => {
  try {
    const items = await Etudiant.find({ role: "student", mustUpdateProfil: false });

    for (let i = 0; i < items.length; i++) {
      await Etudiant.findOneAndUpdate({ _id: items[i]._id }, { mustUpdateProfil: true }, { new: true });
    }

    console.log(`${items.length} documents updated`);
    return res.json({
      Message: "updated successfully"
    });
  } catch (error) {
    console.log("##########:", error);
  }
};

exports.academicProgress = async (req, res) => {
  try {
    const { _id } = req.params;
    if (_id === null || _id === undefined) {
      res.status(406).json({ Message: "Missing required params" });
    }
    const { level, diplome } = req.body;
    const findDuplication = await Etudiant.findOne({ _id, role: "Etudiant" });
    if (!findDuplication) {
      res.status(409).json({ Message: "User doesn't exist" });
    }

    let graduationDate = null;
    if (level === '3') {
      graduationDate = new Date();
    }

    const updateStudent = await Etudiant.findOneAndUpdate(
      { _id, role: "Etudiant" },
      { niveau:level, diplome },
      { new: true }
    );
    if (!updateStudent) {
      return res.status(400).json({ message: "Failed to update" });
    }
    return res.status(200).json({ message: "Academic progress updated successfully", data: updateStudent });
  } catch (error) {
    console.log("Error updating academic progress:", error);
    return res.status(500).send({ message: "Server error" });
  }
};
